const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ThreadView = require('../models/ThreadView');
const ThreadUpvote = require('../models/ThreadUpvote');
const { getIO } = require('../socket');
const sequelize = require('../config/db');

exports.getAllThreads = async (req, res) => {
    try {
        const { courseId, batchId } = req.query;
        let where = courseId ? { courseId } : {};

        if (req.user && req.user.role === 'Student') {
            const student = await User.findByPk(req.user.id, { attributes: ['batchId'] });
            if (student && student.batchId) {
                const { Op } = require('sequelize');
                where.batchId = {
                    [Op.or]: [student.batchId, null]
                };
            } else {
                where.batchId = null;
            }
        } else if (batchId) {
            where.batchId = batchId;
        }

        // Fetch threads with accurate comment count
        const threads = await Thread.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar', 'role']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(threads);
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

        res.json({ ...thread.toJSON(), repliesCount: (thread.comments || []).length });
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
            const student = await User.findByPk(req.user.id, { attributes: ['batchId'] });
            if (student && student.batchId) {
                actualBatchId = student.batchId;
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

        // Notify teachers if a student creates a thread
        if (req.user.role === 'Student') {
            await Notification.create({
                title: 'New Discussion Question',
                message: `${req.user.name} started a new discussion: "${title}"`,
                type: 'info',
                role: 'Teacher',
                referenceId: thread.id
            });
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

// POST /forum/:id/comments/:commentId/accept — Teacher marks a comment as accepted answer
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
