const Lesson = require('../models/Lesson');
const Module = require('../models/Module');

exports.createLesson = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId ?? null;

        // Verify the module belongs to this tenant before adding a lesson
        if (req.user?.role !== 'SuperAdmin') {
            const module = await Module.findOne({ where: { id: req.body.moduleId, tenantId } });
            if (!module) return res.status(403).json({ message: 'Module not found or access denied' });
        }

        const lessonData = {
            ...req.body,
            tenantId,  // always inject from server
        };
        delete lessonData.id;
        console.log("Creating lesson with data:", lessonData);
        const lesson = await Lesson.create(lessonData);
        res.status(201).json(lesson);
    } catch (err) {
        console.error("Error creating lesson:", err);
        res.status(400).json({ message: err.message });
    }
};

exports.getLessonsByModule = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId ?? null;

        // Verify module belongs to this tenant
        if (req.user?.role !== 'SuperAdmin') {
            const module = await Module.findOne({ where: { id: req.params.moduleId, tenantId } });
            if (!module) return res.status(403).json({ message: 'Module not found or access denied' });
        }

        const lessons = await Lesson.findAll({
            where: { moduleId: req.params.moduleId },
            order: [['lessonOrder', 'ASC']]
        });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId ?? null;
        // Lessons are scoped by their module's tenantId
        const where = { id: req.params.id };
        const lesson = await Lesson.findOne({ where });
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        // Check the parent module belongs to this tenant
        if (req.user?.role !== 'SuperAdmin') {
            const module = await Module.findOne({ where: { id: lesson.moduleId, tenantId } });
            if (!module) return res.status(403).json({ message: 'Access denied: lesson belongs to another tenant' });
        }

        const { tenantId: _t, ...updateData } = req.body;
        await lesson.update(updateData);
        res.json(lesson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId ?? null;
        const lesson = await Lesson.findByPk(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        if (req.user?.role !== 'SuperAdmin') {
            const module = await Module.findOne({ where: { id: lesson.moduleId, tenantId } });
            if (!module) return res.status(403).json({ message: 'Access denied: lesson belongs to another tenant' });
        }

        await lesson.destroy();
        res.json({ message: 'Lesson deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

