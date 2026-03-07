const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

exports.getAllAssignments = async (req, res, next) => {
    try {
        const { courseId } = req.query;
        const where = courseId ? { courseId } : {};
        const assignments = await Assignment.findAll({ where });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.create(req.body);
        res.status(201).json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Not found' });
        await assignment.update(req.body);
        res.json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getSubmissions = async (req, res, next) => {
    try {
        const submissions = await Submission.findAll({ where: { assignmentId: req.params.id } });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Not found' });
        await assignment.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
