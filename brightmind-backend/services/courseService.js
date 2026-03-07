const Course = require('../models/Course');

class CourseService {
    async getAllCourses() {
        return await Course.findAll();
    }

    async getCoursesByTeacher(teacherId) {
        return await Course.findAll({ where: { teacherId } });
    }

    async getCoursesByStudent(studentId) {
        const Enrollment = require('../models/Enrollment');
        // This is a manual join since associations aren't fully defined yet
        const enrollments = await Enrollment.findAll({ where: { userId: studentId } });
        const courseIds = enrollments.map(e => e.courseId);
        return await Course.findAll({ where: { id: courseIds } });
    }

    async getCourseById(id) {
        return await Course.findByPk(id);
    }

    async createCourse(courseData) {
        return await Course.create(courseData);
    }

    async updateCourse(id, updateData) {
        const course = await Course.findByPk(id);
        if (!course) return null;
        return await course.update(updateData);
    }

    async deleteCourse(id) {
        const course = await Course.findByPk(id);
        if (!course) return false;
        await course.destroy();
        return true;
    }
}

module.exports = new CourseService();
