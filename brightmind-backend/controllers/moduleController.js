const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

exports.createModule = async (req, res) => {
    try {
        const module = await Module.create(req.body);
        res.status(201).json(module);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getModulesByCourse = async (req, res) => {
    try {
        const modules = await Module.findAll({
            where: { courseId: req.params.courseId },
            include: [{ model: Lesson, as: 'lessons' }],
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
        const module = await Module.findByPk(req.params.id);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        await module.update(req.body);
        res.json(module);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteModule = async (req, res) => {
    try {
        const module = await Module.findByPk(req.params.id);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        await module.destroy();
        res.json({ message: 'Module deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
