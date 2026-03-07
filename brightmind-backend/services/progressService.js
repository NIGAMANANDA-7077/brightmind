const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const LessonProgress = require('../models/LessonProgress');

class ProgressService {
    async enrollStudent(studentId, courseId) {
        const course = await Course.findByPk(courseId);
        if (!course) throw new Error('Course not found');

        const existingEnrollment = await Enrollment.findOne({ where: { studentId, courseId } });
        if (existingEnrollment) throw new Error('Already enrolled in this course');

        const enrollment = await Enrollment.create({ studentId, courseId });
        await course.increment('studentsEnrolled');
        return enrollment;
    }

    async getStudentEnrollments(studentId) {
        const enrollments = await Enrollment.findAll({ where: { studentId } });
        const courseIds = enrollments.map(e => e.courseId);
        const courses = await Course.findAll({ where: { id: courseIds } });

        return courses.map(c => {
            const enrollData = enrollments.find(e => e.courseId === c.id);
            return {
                ...c.toJSON(),
                progress: enrollData.progressPercentage,
                enrolledAt: enrollData.enrolledAt
            };
        });
    }

    async markLessonComplete(studentId, courseId, moduleId, lessonId) {
        const enrollment = await Enrollment.findOne({ where: { studentId, courseId } });
        if (!enrollment) throw new Error('Not enrolled in course');

        const [progress, created] = await LessonProgress.findOrCreate({
            where: { studentId, lessonId },
            defaults: { courseId, moduleId, isCompleted: true, completedAt: new Date() }
        });

        if (!created && !progress.isCompleted) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
            await progress.save();
        }

        // Recalculate progress
        const course = await Course.findByPk(courseId);
        if (course && course.modules) {
            const allLessons = course.modules.flatMap(m => m.lessons || []);
            const totalLessons = allLessons.length;

            if (totalLessons > 0) {
                const completedCount = await LessonProgress.count({
                    where: { studentId, courseId, isCompleted: true }
                });

                const newPercentage = Math.round((completedCount / totalLessons) * 100);
                enrollment.progressPercentage = newPercentage;
                await enrollment.save();
            }
        }

        return enrollment.progressPercentage;
    }

    async getCourseProgress(studentId, courseId) {
        return await LessonProgress.findAll({
            where: { studentId, courseId, isCompleted: true },
            attributes: ['lessonId', 'completedAt']
        });
    }
}

module.exports = new ProgressService();
