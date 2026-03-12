const Lesson = require('../models/Lesson');

exports.createLesson = async (req, res) => {
    try {
        console.log("Creating lesson with data:", req.body);
        const lesson = await Lesson.create(req.body);
        res.status(201).json(lesson);
    } catch (err) {
        console.error("Error creating lesson:", err);
        res.status(400).json({ message: err.message });
    }
};

exports.getLessonsByModule = async (req, res) => {
    try {
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
        const lesson = await Lesson.findByPk(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        await lesson.update(req.body);
        res.json(lesson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByPk(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        await lesson.destroy();
        res.json({ message: 'Lesson deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
