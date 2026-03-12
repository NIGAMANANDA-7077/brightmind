const Course = require('../models/Course');

class CourseService {
    async getAllCourses() {
        const User = require('../models/User');
        const courses = await Course.findAll();

        return await Promise.all(courses.map(async (course) => {
            let instructorName = 'Unknown Instructor';
            let instructorAvatar = 'https://ui-avatars.com/api/?name=User&background=random';

            if (course.teacherId) {
                const teacher = await User.findByPk(course.teacherId);
                if (teacher) {
                    instructorName = teacher.name;
                    instructorAvatar = teacher.avatar;
                }
            }

            return {
                ...course.toJSON(),
                instructor: instructorName,
                instructorAvatar: instructorAvatar
            };
        }));
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
        const User = require('../models/User');
        const Module = require('../models/Module');
        const Lesson = require('../models/Lesson');

        const course = await Course.findByPk(id, {
            include: [
                {
                    model: Module,
                    as: 'courseModules',
                    include: [
                        {
                            model: Lesson,
                            as: 'lessons'
                        }
                    ]
                }
            ],
            order: [
                [{ model: Module, as: 'courseModules' }, 'moduleOrder', 'ASC'],
                [{ model: Module, as: 'courseModules' }, { model: Lesson, as: 'lessons' }, 'lessonOrder', 'ASC']
            ]
        });

        if (!course) return null;

        let instructorName = 'Unknown Instructor';
        let instructorAvatar = 'https://ui-avatars.com/api/?name=User&background=random';
        if (course.teacherId) {
            const teacher = await User.findByPk(course.teacherId);
            if (teacher) {
                instructorName = teacher.name;
                instructorAvatar = teacher.avatar;
            }
        }

        return {
            ...course.toJSON(),
            instructor: instructorName,
            instructorAvatar: instructorAvatar
        };
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
