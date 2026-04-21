const BlogPost = require('../models/BlogPost');
const { Op } = require('sequelize');

// Slug generator
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

// Estimate read time
const estimateReadTime = (content = '') => {
    const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} Min Read`;
};

// GET /api/blogs — public, only Published
exports.getPublicBlogs = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;
        const where = { status: 'Published' };
        if (category && category !== 'All') where.category = category;
        if (search) where.title = { [Op.like]: `%${search}%` };

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await BlogPost.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({ success: true, data: rows, total: count, page: parseInt(page) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/blogs/:slug — public single post
exports.getPublicBlogBySlug = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ where: { slug: req.params.slug, status: 'Published' } });
        if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });
        await post.increment('views');
        res.json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/blogs — admin, all posts
exports.getAllBlogs = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/admin/blogs — create
exports.createBlog = async (req, res) => {
    try {
        const { title, excerpt, content, image, category, status } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

        let slug = generateSlug(title);
        // Ensure uniqueness
        const existing = await BlogPost.findOne({ where: { slug } });
        if (existing) slug = `${slug}-${Date.now()}`;

        const post = await BlogPost.create({
            title,
            slug,
            excerpt,
            content,
            image,
            category: category || 'General',
            readTime: estimateReadTime(content),
            status: status || 'Draft',
            authorId: req.user?.id || null,
            authorName: req.user?.name || 'Admin',
            authorAvatar: req.user?.avatar || null
        });

        res.status(201).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/admin/blogs/:id — update
exports.updateBlog = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });

        const { title, excerpt, content, image, category, status } = req.body;
        const updates = { excerpt, content, image, category, status };
        if (title && title !== post.title) {
            updates.title = title;
            let slug = generateSlug(title);
            const existing = await BlogPost.findOne({ where: { slug, id: { [Op.ne]: post.id } } });
            updates.slug = existing ? `${slug}-${Date.now()}` : slug;
        }
        if (content) updates.readTime = estimateReadTime(content);

        await post.update(updates);
        res.json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/admin/blogs/:id
exports.deleteBlog = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });
        await post.destroy();
        res.json({ success: true, message: 'Blog post deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/admin/blogs/:id/publish — toggle status
exports.togglePublish = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Blog post not found' });
        const newStatus = post.status === 'Published' ? 'Draft' : 'Published';
        await post.update({ status: newStatus });
        res.json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
