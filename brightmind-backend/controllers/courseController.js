const courseService = require('../services/courseService');
const logAdminActivity = require('../utils/logAdminActivity');

// HYBRID MODEL: All admins see ALL courses (shared/global)
exports.getAllCourses = async (req, res, next) => {
    try {
        const onlyPublished = req.query.published === 'true';
        // No tenant filter — courses are global/shared
        const courses = await courseService.getAllCourses(onlyPublished);
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

// Course is fetched globally; modules inside are filtered by THIS tenant
exports.getCourseById = async (req, res, next) => {
    try {
        // For public route req.user is undefined — pass null so all modules are included
        const tenantId = req.user ? (req.user.role === 'SuperAdmin' ? null : (req.user.tenantId ?? null)) : null;
        const course = await courseService.getCourseById(req.params.id, tenantId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCourse = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenantId || null;
        const creatorName = req.user?.name || null;
        const course = await courseService.createCourse(req.body, req.user?.id, tenantId, creatorName);
        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'course', 'CREATE', `Admin created course "${req.body.title || course.title}"`, req.ip);
        }
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Only course creator or SuperAdmin can update
exports.updateCourse = async (req, res, next) => {
    try {
        const course = await courseService.updateCourse(req.params.id, req.body, req.user?.id, req.user?.role);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'course', 'UPDATE', `Admin updated course "${req.body.title || course.title}"`, req.ip);
        }
        res.json(course);
    } catch (err) {
        const status = err.status || 400;
        res.status(status).json({ message: err.message });
    }
};

// Only course creator or SuperAdmin can delete
exports.deleteCourse = async (req, res, next) => {
    try {
        const success = await courseService.deleteCourse(req.params.id, req.user?.id, req.user?.role);
        if (!success) return res.status(404).json({ message: 'Course not found' });
        if (req.user?.id && ['Admin', 'SuperAdmin'].includes(req.user?.role)) {
            logAdminActivity(req.user.id, 'course', 'DELETE', `Admin deleted course (ID: ${req.params.id})`, req.ip);
        }
        res.json({ message: 'Course deleted' });
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ message: err.message });
    }
};

