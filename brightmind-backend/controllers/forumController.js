const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');
const ThreadView = require('../models/ThreadView');
const ThreadUpvote = require('../models/ThreadUpvote');
const BatchStudent = require('../models/BatchStudent');
const { getIO } = require('../socket');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

exports.getAllThreads = async (req, res) => {
    try {
        const { courseId, batchId } = req.query;
        let where = courseId ? { courseId } : {};

        if (req.user && req.user.role === 'Student') {
            // Fetch ALL batches the student belongs to (supports multi-batch students)
            const studentBatchRows = await BatchStudent.findAll({
                where: { studentId: req.user.id },
                attributes: ['batchId']
            });
            const studentBatchIds = studentBatchRows.map(r => r.batchId);

            if (studentBatchIds.length > 0) {
                where.batchId = { [Op.in]: studentBatchIds };
            } else {
                // Student has no batch membership
                where.batchId = null;
            }
        } else if (req.user && req.user.role === 'Teacher') {
            if (batchId) {
                where.batchId = batchId;
            } else {
                // Filter threads to only those in teacher's batches
                const teacherBatches = await Batch.findAll({
                    where: { teacherId: req.user.id },
                    attributes: ['id']
                });
                const batchIds = teacherBatches.map(b => b.id);
                if (batchIds.length > 0) {
                    where.batchId = { [Op.in]: batchIds };
                }
            }
        } else if (batchId) {
            where.batchId = batchId;
        }

        const threads = await Thread.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar', 'role']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title']
                },
                {
                    model: Batch,
                    as: 'batch',
                    attributes: ['id', 'batchName'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Attach courseName and batchName as flat fields for easy frontend use
        const result = threads.map(t => ({
            ...t.toJSON(),
            courseName: t.course?.title || t.courseName,
            batchName: t.batch?.batchName || null
        }));

        res.json(result);
    } catch (err) {
        console.error("Error in getAllThreads:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.getThreadById = async (req, res) => {
    try {
        const threadId = req.params.id;
        const userId = req.user?.id;

        console.log(`[DEBUG] getThreadById: threadId=${threadId}, userId=${userId}`);

        const thread = await Thread.findByPk(threadId, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar', 'role']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title']
                },
                {
                    model: Batch,
                    as: 'batch',
                    attributes: ['id', 'batchName'],
                    required: false
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [
                        {
                            model: User,
                            as: 'author',
                            attributes: ['id', 'name', 'avatar', 'role']
                        }
                    ]
                }
            ],
            order: [[{ model: Comment, as: 'comments' }, 'createdAt', 'ASC']]
        });

        if (!thread) {
            console.warn(`[DEBUG] Thread not found for ID: ${threadId}`);
            return res.status(404).json({ message: 'Thread not found' });
        }

        // Unique View Logic
        const [viewRecord, created] = await ThreadView.findOrCreate({
            where: { threadId, userId },
            defaults: { threadId, userId }
        });

        if (created) {
            await thread.increment('views');
        }

        res.json({
            ...thread.toJSON(),
            courseName: thread.course?.title || null,
            batchName: thread.batch?.batchName || null,
            repliesCount: (thread.comments || []).length
        });
    } catch (err) {
        console.error("Error in getThreadById:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.createThread = async (req, res) => {
    try {
        const { title, description, courseId, batchId } = req.body;
        
        let actualBatchId = batchId || null;
        if (req.user.role === 'Student') {
            if (actualBatchId) {
                // Validate the student actually belongs to the provided batch
                const membership = await BatchStudent.findOne({
                    where: { batchId: actualBatchId, studentId: req.user.id }
                });
                if (!membership) {
                    return res.status(403).json({ message: 'You are not a member of the selected batch' });
                }
            } else {
                // Fallback: use the batchId stored on the user record
                const student = await User.findByPk(req.user.id, { attributes: ['batchId'] });
                if (student && student.batchId) {
                    actualBatchId = student.batchId;
                }
            }
        }

        const thread = await Thread.create({
            title,
            description,
            courseId,
            batchId: actualBatchId,
            authorId: req.user.id,
            authorName: req.user.name,
            authorRole: req.user.role,
            authorAvatar: req.user.avatar
        });

        // Notify teachers if a student creates a thread (per-user)
        if (req.user.role === 'Student') {
            try {
                // Find teachers of the student's batch
                let teacherIds = [];
                if (actualBatchId) {
                    const batch = await Batch.findByPk(actualBatchId, { attributes: ['teacherId'] });
                    if (batch?.teacherId) teacherIds.push(batch.teacherId);
                }
                // Fallback: all teachers if no batch
                if (teacherIds.length === 0) {
                    const teachers = await User.findAll({ where: { role: 'Teacher' }, attributes: ['id'] });
                    teacherIds = teachers.map(t => t.id);
                }
                const filtered = teacherIds.filter(id => id !== req.user.id);
                if (filtered.length > 0) {
                    const records = filtered.map(uid => ({
                        userId: uid,
                        title: '💬 New Discussion Question',
                        message: `${req.user.name} started: "${title}"`,
                        type: 'discussion',
                        role: 'Teacher',
                        referenceId: thread.id,
                        link: `/teacher/forum/thread/${thread.id}`,
                        read: false
                    }));
                    await Notification.bulkCreate(records, { ignoreDuplicates: true });
                }
            } catch (notifErr) {
                console.error('Forum thread notification error:', notifErr.message);
            }
        }

        // Notify batch students when a teacher starts a discussion
        if (req.user.role === 'Teacher' && actualBatchId) {
            try {
                const batchStudents = await User.findAll({
                    include: [{
                        model: Batch,
                        as: 'enrolledBatches',
                        where: { id: actualBatchId },
                        through: { attributes: [] },
                        required: true
                    }],
                    attributes: ['id']
                });
                const studentIds = batchStudents.map(s => s.id).filter(id => id !== req.user.id);
                if (studentIds.length > 0) {
                    const records = studentIds.map(uid => ({
                        userId: uid,
                        title: '📢 New Discussion in Your Batch',
                        message: `${req.user.name} (Teacher) started: "${title}"`,
                        type: 'discussion',
                        role: 'Student',
                        referenceId: thread.id,
                        link: `/student/forum/thread/${thread.id}`,
                        read: false
                    }));
                    await Notification.bulkCreate(records, { ignoreDuplicates: true });
                }
            } catch (notifErr) {
                console.error('Teacher forum notification error:', notifErr.message);
            }
        }

        // Emit real-time event to all connected clients
        try {
            getIO().emit('new_thread', thread.toJSON());
        } catch (_) { }

        res.status(201).json(thread);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const threadId = req.params.id;

        const thread = await Thread.findByPk(threadId);
        if (!thread) return res.status(404).json({ message: 'Thread not found' });

        const comment = await Comment.create({
            threadId,
            content,
            authorId: req.user.id,
            authorName: req.user.name,
            authorRole: req.user.role,
            authorAvatar: req.user.avatar
        });

        // Increment reply count on thread
        await thread.increment('repliesCount');

        const commentWithAuthor = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'role'] }]
        });

        // Emit real-time event
        try {
            getIO().to(`thread_${threadId}`).emit('new_comment', commentWithAuthor.toJSON());
        } catch (_) { }

        // Notify thread author (if someone else replied)
        try {
            if (thread.authorId && thread.authorId !== req.user.id) {
                await Notification.create({
                    userId: thread.authorId,
                    title: '💬 New Reply on Your Discussion',
                    message: `${req.user.name} replied to "${thread.title}"`,
                    type: 'discussion',
                    referenceId: thread.id,
                    link: `/${thread.authorRole?.toLowerCase() === 'teacher' ? 'teacher' : 'student'}/forum/thread/${thread.id}`,
                    read: false
                });
            }
        } catch (notifErr) {
            console.error('Comment notification error:', notifErr.message);
        }

        res.status(201).json(commentWithAuthor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.upvoteThread = async (req, res) => {
    try {
        const threadId = req.params.id;
        const userId = req.user.id;

        const thread = await Thread.findByPk(threadId);
        if (!thread) return res.status(404).json({ message: 'Thread not found' });

        // Unique Upvote Logic
        const [upvoteRecord, created] = await ThreadUpvote.findOrCreate({
            where: { threadId, userId },
            defaults: { threadId, userId }
        });

        if (!created) {
            return res.status(400).json({ message: 'You have already upvoted this thread' });
        }

        await thread.increment('upvotes');
        res.json({ ...thread.toJSON(), upvotes: thread.upvotes + 1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /forum/:id/status — Teacher marks thread Resolved or Closed
exports.updateThreadStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['Open', 'Closed', 'Resolved'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be Open, Closed, or Resolved.' });
        }

        const thread = await Thread.findByPk(req.params.id);
        if (!thread) return res.status(404).json({ message: 'Thread not found' });

        await thread.update({ status });

        try {
            getIO().emit('thread_status_updated', { threadId: thread.id, status });
        } catch (_) { }

        res.json({ success: true, thread });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /forum/:id/comments/:commentId/upvote — Upvote an answer/comment
exports.upvoteComment = async (req, res) => {
    try {
        const comment = await Comment.findOne({ where: { id: req.params.commentId, threadId: req.params.id } });
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Prevent self-upvote
        if (comment.authorId === req.user.id) {
            return res.status(400).json({ message: 'You cannot upvote your own answer' });
        }

        await comment.increment('upvotes');
        res.json({ success: true, upvotes: comment.upvotes + 1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /forum/:id/comments/:commentId — Delete a comment (author or teacher/admin)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findOne({ where: { id: req.params.commentId, threadId: req.params.id } });
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const isAuthor = comment.authorId === req.user.id;
        const isMod = req.user.role === 'Teacher' || req.user.role === 'Admin';
        if (!isAuthor && !isMod) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        const thread = await Thread.findByPk(req.params.id);
        if (thread) await thread.decrement('repliesCount');

        await comment.destroy();

        try { getIO().to(`thread_${req.params.id}`).emit('comment_deleted', { commentId: req.params.commentId }); } catch (_) { }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /forum/:id — Delete a thread (author or teacher/admin)
exports.deleteThread = async (req, res) => {
    try {
        const thread = await Thread.findByPk(req.params.id);
        if (!thread) return res.status(404).json({ message: 'Thread not found' });

        const isAuthor = thread.authorId === req.user.id;
        const isMod = req.user.role === 'Teacher' || req.user.role === 'Admin';
        if (!isAuthor && !isMod) {
            return res.status(403).json({ message: 'Not authorized to delete this thread' });
        }

        // Cascade delete comments and notifications
        await Comment.destroy({ where: { threadId: req.params.id } });
        await Notification.destroy({ where: { referenceId: req.params.id } });
        await thread.destroy();

        try { getIO().emit('thread_deleted', { threadId: req.params.id }); } catch (_) { }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.acceptAnswer = async (req, res) => {
    try {
        const { id: threadId, commentId } = req.params;

        // Unmark any previously accepted answer in this thread
        await Comment.update({ isAccepted: false }, { where: { threadId } });

        const comment = await Comment.findOne({ where: { id: commentId, threadId } });
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        await comment.update({ isAccepted: true });

        // Also mark thread as Resolved
        const thread = await Thread.findByPk(threadId);
        if (thread) await thread.update({ status: 'Resolved' });

        try {
            getIO().to(`thread_${threadId}`).emit('answer_accepted', { commentId, threadId });
        } catch (_) { }

        res.json({ success: true, comment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
