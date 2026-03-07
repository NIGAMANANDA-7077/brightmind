const progressService = require('../services/progressService');

exports.enroll = async (req, res, next) => {
    try {
        const enrollment = await progressService.enrollStudent(req.user.id, req.params.courseId);
        res.status(201).json({ success: true, enrollment });
    } catch (error) {
        if (error.message === 'Course not found') return res.status(404).json({ success: false, message: error.message });
        if (error.message === 'Already enrolled in this course') return res.status(400).json({ success: false, message: error.message });

        console.error(error);
        res.status(500).json({ success: false, message: 'Server error enrolling in course' });
    }
};

exports.getMyCourses = async (req, res, next) => {
    try {
        const courses = await progressService.getStudentEnrollments(req.user.id);
        res.json({ success: true, courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching enrollments' });
    }
};

exports.markComplete = async (req, res, next) => {
    try {
        const { courseId, moduleId, lessonId } = req.body;
        const progressPercentage = await progressService.markLessonComplete(req.user.id, courseId, moduleId, lessonId);

        res.json({ success: true, message: 'Lesson marked complete', progressPercentage });
    } catch (error) {
        if (error.message === 'Not enrolled in course') return res.status(403).json({ success: false, message: error.message });

        console.error(error);
        res.status(500).json({ success: false, message: 'Server error marking lesson complete' });
    }
};

exports.getProgress = async (req, res, next) => {
    try {
        const completedLessons = await progressService.getCourseProgress(req.user.id, req.params.courseId);
        res.json({ success: true, completedLessons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching progress' });
    }
};
