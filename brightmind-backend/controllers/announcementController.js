const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Batch = require('../models/Batch');
const BatchStudent = require('../models/BatchStudent');
const { Op } = require('sequelize');
const logAdminActivity = require('../utils/logAdminActivity');

// Helper: get all student userIds for a given batchId
async function getStudentIdsForBatch(batchId) {
    const rows = await BatchStudent.findAll({ where: { batchId }, attributes: ['studentId'] });
    const ids = rows.map(r => r.studentId);
    // Also include students with batchId on User directly
    const direct = await User.findAll({ where: { batchId, role: 'Student' }, attributes: ['id'] });
    direct.forEach(u => { if (!ids.includes(u.id)) ids.push(u.id); });
    return ids;
}

// Helper: get all userIds for a given role (Student/Teacher) within a tenant
async function getUserIdsByRole(role, tenantId = null) {
    const where = { role };
    if (tenantId) where.tenantId = tenantId;
    const users = await User.findAll({ where, attributes: ['id'] });
    return users.map(u => u.id);
}

// Helper: bulk-create per-user notifications, excluding the sender
async function createUserNotifications(userIds, notifData, excludeUserId = null) {
    if (!userIds || userIds.length === 0) return;
    const filtered = excludeUserId ? userIds.filter(id => id !== excludeUserId) : userIds;
    if (filtered.length === 0) return;
    const records = filtered.map(uid => ({ ...notifData, userId: uid, id: undefined }));
    await Notification.bulkCreate(records, { ignoreDuplicates: true });
}

exports.getAllAnnouncements = async (req, res, next) => {
    try {
        const { batchId } = req.query;
        let where = {};
        
        // Scope by tenant (SuperAdmin sees all)
        if (req.user?.role !== 'SuperAdmin') {
            where.tenantId = req.user?.tenantId || null;
        }

        if (req.user && req.user.role === 'Student') {
            const student = await User.findByPk(req.user.id);
            // Get all batches for this student
            const batchStudentRows = await BatchStudent.findAll({ where: { studentId: req.user.id }, attributes: ['batchId'] });
            const batchIds = batchStudentRows.map(r => r.batchId);
            if (student?.batchId && !batchIds.includes(student.batchId)) batchIds.push(student.batchId);

            if (batchIds.length === 0) {
                where = { batchId: null, audience: { [Op.in]: ['All', 'Students'] } };
            } else {
                where = {
                    [Op.or]: [
                        { batchId: { [Op.in]: batchIds } },
                        { batchId: null, audience: { [Op.in]: ['All', 'Students'] } }
                    ]
                };
            }
        } else if (req.user && req.user.role === 'Teacher') {
            if (batchId) {
                where.batchId = batchId;
            } else {
                const batches = await Batch.findAll({ where: { teacherId: req.user.id }, attributes: ['id'] });
                const batchIds = batches.map(b => b.id);
                where = {
                    [Op.or]: [
                        ...(batchIds.length > 0 ? [{ batchId: { [Op.in]: batchIds } }] : []),
                        { batchId: null, audience: { [Op.in]: ['All', 'Teachers'] } },
                        { postedBy: req.user.name || req.user.id }
                    ]
                };
            }
        } else {
            // Admin
            if (batchId) where.batchId = batchId;
        }

        const announcements = await Announcement.findAll({
            where,
            include: [{ model: Batch, as: 'batch', attributes: ['id', 'batchName'] }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAnnouncement = async (req, res, next) => {
    try {
        const { title, message, audience, batchId, date, status, allMyBatches } = req.body;
        
        // Teacher: must specify batch OR allMyBatches
        if (req.user && req.user.role === 'Teacher' && !batchId && !allMyBatches) {
            return res.status(400).json({ message: 'Teachers must specify a batch for an announcement' });
        }

        // For "All My Batches" teacher announcements, create one announcement per batch
        if (req.user && req.user.role === 'Teacher' && allMyBatches) {
            const teacherBatches = await Batch.findAll({ where: { teacherId: req.user.id }, attributes: ['id', 'batchName'] });
            if (teacherBatches.length === 0) {
                return res.status(400).json({ message: 'No batches assigned to you' });
            }
            // Create one announcement PER batch
            const newAnnouncements = [];
            const allStudentIds = new Set();
            for (const batch of teacherBatches) {
                const item = await Announcement.create({
                    title,
                    message,
                    audience: 'Students',
                    batchId: batch.id,
                    date: date || null,
                    status: status || 'Published',
                    postedBy: req.user?.name || req.user?.id,
                    tenantId: req.user?.tenantId || null
                });
                newAnnouncements.push(item);
                const ids = await getStudentIdsForBatch(batch.id);
                ids.forEach(id => {
                    allStudentIds.add({ studentId: id, batchId: batch.id });
                });
            }
            
            const senderName = req.user?.name || 'Your Teacher';
            const notifBase = {
                title: `📢 ${title}`,
                message: `From ${senderName}: ${(message || '').substring(0, 180)}`,
                type: 'announcement',
                link: '/student/announcements', read: false
            };
            
            // Notify students (for 'all batches', they might be in multiple batches)
            const createdNotifications = [];
            for (const { studentId, batchId } of allStudentIds) {
                if (studentId === req.user.id) continue;
                createdNotifications.push({ ...notifBase, batchId, role: 'Student', referenceId: newAnnouncements.find(a => a.batchId === batchId)?.id, userId: studentId });
            }
            if (createdNotifications.length > 0) {
                await Notification.bulkCreate(createdNotifications, { ignoreDuplicates: true });
            }

            // Return the first one or just a success message (Frontend expects one announcement object to add to state, maybe return an array or just the first)
            // But if frontend expects an array to replace state, it would be difficult.
            // Wait, front-end only appends ONE. The easiest way is to return the first one with its batch data so it doesn't crash.
            const result = await Announcement.findByPk(newAnnouncements[0].id, {
                include: [{ model: Batch, as: 'batch', attributes: ['id', 'batchName'] }]
            });
            return res.status(201).json(result);
        }

        const announcementData = {
            title,
            message,
            audience: req.user?.role === 'Teacher' ? 'Students' : (audience || 'All'),
            batchId: batchId || null,
            date: date || null,
            status: status || 'Published',
            postedBy: req.user?.name || req.user?.id,
            tenantId: req.user?.tenantId || null
        };

        const announcement = await Announcement.create(announcementData);

        // ─── Create per-user notifications (sender excluded) ────
        const senderName = req.user?.name || (req.user?.role === 'Admin' ? 'Admin' : 'Your Teacher');
        const senderId = req.user?.id;

        const notifBase = {
            title: `📢 ${title}`,
            message: `From ${senderName}: ${(message || '').substring(0, 180)}`,
            type: 'announcement',
            referenceId: announcement.id,
            link: '/student/announcements',
            read: false
        };

        if (batchId) {
            // Specific batch → notify all students in that batch (exclude sender)
            const targetUserIds = await getStudentIdsForBatch(batchId);
            await createUserNotifications(targetUserIds, { ...notifBase, batchId, role: 'Student' }, senderId);
        } else if (audience === 'All' || announcementData.audience === 'All') {
            // All users within tenant (students + teachers, NOT admin/sender)
            const tenantId = req.user?.tenantId || null;
            const studentIds = await getUserIdsByRole('Student', tenantId);
            const teacherIds = await getUserIdsByRole('Teacher', tenantId);
            const allIds = [...new Set([...studentIds, ...teacherIds])];
            await createUserNotifications(allIds, { ...notifBase, role: 'All', batchId: null }, senderId);
        } else if (audience === 'Students') {
            // All students within tenant (exclude sender)
            const targetUserIds = await getUserIdsByRole('Student', req.user?.tenantId || null);
            await createUserNotifications(targetUserIds, { ...notifBase, role: 'Student' }, senderId);
        } else if (audience === 'Teachers') {
            // All teachers within tenant (exclude sender)
            const targetUserIds = await getUserIdsByRole('Teacher', req.user?.tenantId || null);
            await createUserNotifications(targetUserIds, { ...notifBase, role: 'Teacher' }, senderId);
        } else {
            // Fallback: per-user for the appropriate role within tenant
            const tenantId = req.user?.tenantId || null;
            const fallbackRole = req.user?.role === 'Teacher' ? 'Student' : 'All';
            const fallbackIds = fallbackRole === 'Student'
                ? await getUserIdsByRole('Student', tenantId)
                : [...(await getUserIdsByRole('Student', tenantId)), ...(await getUserIdsByRole('Teacher', tenantId))];
            await createUserNotifications([...new Set(fallbackIds)], { ...notifBase, role: fallbackRole, batchId: null }, senderId);
        }

        const newAnnouncement = await Announcement.findByPk(announcement.id, {
            include: [{ model: Batch, as: 'batch', attributes: ['id', 'batchName'] }]
        });

        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'announcement', 'CREATE', `Admin created announcement "${title}"`, req.ip);
        }

        res.status(201).json(newAnnouncement);
    } catch (err) {
        console.error('createAnnouncement error:', err);
        res.status(400).json({ message: err.message });
    }
};

exports.deleteAnnouncement = async (req, res, next) => {
    try {
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin' && req.user?.tenantId) where.tenantId = req.user.tenantId;
        const announcement = await Announcement.findOne({ where });
        if (!announcement) return res.status(404).json({ message: 'Not found' });
        
        // Teacher can only delete their own announcements
        if (req.user?.role === 'Teacher' && announcement.postedBy !== req.user.id && announcement.postedBy !== req.user.name) {
            return res.status(403).json({ message: 'You can only delete your own announcements' });
        }

        // Delete associated notifications
        await Notification.destroy({ where: { referenceId: req.params.id } });
        const announcementTitle = announcement.title;
        await announcement.destroy();
        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'announcement', 'DELETE', `Admin deleted announcement "${announcementTitle}"`, req.ip);
        }
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
