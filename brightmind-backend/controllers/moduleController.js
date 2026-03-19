const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

exports.createModule = async (req, res) => {
    try {
        // Inject tenantId from authenticated user — never trust frontend
        const tenantId = req.user?.tenantId ?? null;
        const moduleData = {
            ...req.body,
            tenantId,  // always override with server-side value
        };
        delete moduleData.id; // prevent ID injection
        const module = await Module.create(moduleData);
        res.status(201).json(module);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getModulesByCourse = async (req, res) => {
    try {
        // Only return THIS tenant's modules for the course
        const tenantId = req.user?.role === 'SuperAdmin' ? undefined : (req.user?.tenantId ?? null);
        const where = { courseId: req.params.courseId };
        if (req.user?.role !== 'SuperAdmin') {
            where.tenantId = tenantId;
        }
        const modules = await Module.findAll({
            where,
            include: [{ model: Lesson, as: 'lessons', order: [['lessonOrder', 'ASC']] }],
            order: [
                ['moduleOrder', 'ASC'],
                [{ model: Lesson, as: 'lessons' }, 'lessonOrder', 'ASC']
            ]
        });
        res.json(modules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateModule = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId ?? null;
        // Only allow update of modules belonging to this tenant
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin') {
            where.tenantId = tenantId;
        }
        const module = await Module.findOne({ where });
        if (!module) return res.status(404).json({ message: 'Module not found or access denied' });

        // Strip tenantId from update payload
        const { tenantId: _t, ...updateData } = req.body;
        await module.update(updateData);
        res.json(module);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteModule = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId ?? null;
        const where = { id: req.params.id };
        if (req.user?.role !== 'SuperAdmin') {
            where.tenantId = tenantId;
        }
        const module = await Module.findOne({ where });
        if (!module) return res.status(404).json({ message: 'Module not found or access denied' });
        await module.destroy();
        res.json({ message: 'Module deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

