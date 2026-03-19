const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const AdminActivityLog = require('../models/AdminActivityLog');
// Ensure associations are loaded for include queries
require('../models/associations');

// ─── GET /api/superadmin/admins ───────────────────────────────────────────────
exports.listAdmins = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const admins = await User.findAll({
            where: { role: { [Op.in]: ['Admin', 'SuperAdmin'] } },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        return res.json({ success: true, admins });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/superadmin/create-admin ────────────────────────────────────────
exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, role, status, tenantName } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });

        if (!['Admin', 'SuperAdmin'].includes(role))
            return res.status(400).json({ success: false, message: 'Role must be Admin or SuperAdmin' });

        const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
        if (existing)
            return res.status(409).json({ success: false, message: 'A user with this email already exists' });

        // For Admin role, create a dedicated tenant (institute)
        let tenantId = null;
        if (role === 'Admin') {
            const tenant = await Tenant.create({
                name: tenantName || `${name.trim()} Academy`,
                createdBy: req.user.id
            });
            tenantId = tenant.id;
        }

        const newAdmin = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,  // beforeCreate hook hashes it
            role: role || 'Admin',
            status: status || 'Active',
            tenantId
        });

        const { password: _, ...adminData } = newAdmin.toJSON();
        return res.status(201).json({ success: true, user: adminData });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /api/superadmin/admins/:id/status ──────────────────────────────────
exports.updateAdminStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Active', 'Suspended'].includes(status))
            return res.status(400).json({ success: false, message: 'Status must be Active or Suspended' });

        // Prevent SuperAdmin from suspending themselves
        if (req.params.id === String(req.user.id))
            return res.status(400).json({ success: false, message: 'You cannot suspend your own account' });

        const admin = await User.findOne({
            where: { id: req.params.id, role: ['Admin', 'SuperAdmin'] }
        });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        await admin.update({ status });
        return res.json({ success: true, message: `Admin ${status === 'Active' ? 'activated' : 'suspended'} successfully` });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE /api/superadmin/admins/:id ────────────────────────────────────────
exports.deleteAdmin = async (req, res) => {
    try {
        if (req.params.id === String(req.user.id))
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });

        const admin = await User.findOne({
            where: { id: req.params.id, role: ['Admin', 'SuperAdmin'] }
        });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        await admin.destroy();
        return res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /api/superadmin/admins/:id/reset-password ─────────────────────────
exports.resetAdminPassword = async (req, res) => {
    try {
        const { new_password } = req.body;
        if (!new_password || new_password.length < 6)
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

        const admin = await User.findOne({
            where: { id: req.params.id, role: ['Admin', 'SuperAdmin'] }
        });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        const hashed = await bcrypt.hash(new_password, 10);
        await admin.update({ password: hashed });
        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/superadmin/activity-logs ───────────────────────────────────────
// Query params: adminId, module, date (YYYY-MM-DD), page, limit
exports.getAllAdminActivities = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const { adminId, module: moduleName, date, page = 1, limit = 50 } = req.query;

        const where = {};
        if (adminId) where.adminId = adminId;
        if (moduleName) where.moduleName = moduleName;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.createdAt = { [Op.between]: [start, end] };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: logs } = await AdminActivityLog.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'admin',
                attributes: ['id', 'name', 'email', 'role', 'avatar']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        return res.json({ success: true, total: count, page: parseInt(page), logs });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


exports.getAdminActivity = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const admin = await User.findOne({
            where: { id: req.params.id, role: { [Op.in]: ['Admin', 'SuperAdmin'] } },
            attributes: ['id', 'name', 'email', 'role', 'status', 'avatar']
        });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        const logs = await AdminActivityLog.findAll({
            where: { adminId: req.params.id },
            order: [['createdAt', 'DESC']],
            limit: 100
        });

        return res.json({ success: true, admin, logs });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin Impersonation ──────────────────────────────────────────────
exports.impersonateAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;
        const superadminId = req.user.id;

        const admin = await User.findByPk(adminId);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        if (admin.role !== 'Admin') return res.status(400).json({ success: false, message: 'Only Admin roles can be impersonated' });

        const authService = require('../services/authService');
        const SuperAdminActivityLog = require('../models/SuperAdminActivityLog');

        // Generate impersonation token
        const token = authService.generateToken(admin.id, { 
            tenantId: admin.tenantId,
            originalUserId: superadminId,
            originalUserName: req.user.name,
            isImpersonating: true 
        });

        await SuperAdminActivityLog.create({
            superadminId,
            adminId,
            action: `Super Admin impersonated Admin: ${admin.name} (${admin.email})`
        });

        const { password, ...adminPayload } = admin.toJSON();

        res.json({
            success: true,
            message: `Now viewing as ${admin.name}`,
            user: {
                ...adminPayload,
                token,
                isImpersonating: true,
                originalUserName: req.user.name
            }
        });
    } catch (err) {
        console.error('[Impersonation Error]:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.exitImpersonation = async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ success: false, message: 'No auth header' });
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        if (!decoded.originalUserId) {
            return res.status(400).json({ success: false, message: 'No active impersonation session found' });
        }

        const superadmin = await User.findByPk(decoded.originalUserId);
        if (!superadmin) return res.status(404).json({ success: false, message: 'Original Super Admin not found' });

        const authService = require('../services/authService');
        const SuperAdminActivityLog = require('../models/SuperAdminActivityLog');

        await SuperAdminActivityLog.create({
            superadminId: superadmin.id,
            adminId: req.user.id,
            action: `Super Admin exited impersonation of Admin: ${req.user.name}`
        });

        const newToken = authService.generateToken(superadmin.id);
        const { password, ...superadminPayload } = superadmin.toJSON();

        res.json({
            success: true,
            message: 'Exited impersonation successfully',
            user: {
                ...superadminPayload,
                token: newToken
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/superadmin/tenants ──────────────────────────────────────────────
exports.listTenants = async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'members',
                where: { role: 'Admin' },
                attributes: ['id', 'name', 'email', 'status'],
                required: false
            }]
        });
        return res.json({ success: true, tenants });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/superadmin/tenants/:id/stats ────────────────────────────────────
exports.getTenantStats = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const Course = require('../models/Course');
        const Batch = require('../models/Batch');
        const Exam = require('../models/Exam');
        const tenantId = req.params.id;

        const [students, teachers, courses, batches, exams] = await Promise.all([
            User.count({ where: { tenantId, role: 'Student' } }),
            User.count({ where: { tenantId, role: 'Teacher' } }),
            Course.count({ where: { tenantId } }),
            Batch.count({ where: { tenantId } }),
            Exam.count({ where: { tenantId } })
        ]);

        return res.json({ success: true, stats: { students, teachers, courses, batches, exams } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
