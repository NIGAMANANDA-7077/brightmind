const courseService = require('../services/courseService');

exports.getAllCourses = async (req, res, next) => {
    try {
        const courses = await courseService.getAllCourses();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTeacherCourses = async (req, res, next) => {
    try {
        const courses = await courseService.getCoursesByTeacher(req.params.teacherId);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStudentCourses = async (req, res, next) => {
    try {
        const courses = await courseService.getCoursesByStudent(req.params.studentId);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCourseById = async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCourse = async (req, res, next) => {
    try {
        const course = await courseService.createCourse(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const course = await courseService.updateCourse(req.params.id, req.body);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const success = await courseService.deleteCourse(req.params.id);
        if (!success) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
