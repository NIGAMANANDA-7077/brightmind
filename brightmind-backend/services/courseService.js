const Course = require('../models/Course');

// Generate a unique slug from title
function generateSlug(title) {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    return `${base}-${Date.now().toString(36)}`;
}

class CourseService {
    // GLOBAL: return ALL courses across ALL tenants (hybrid model)
    async getAllCourses(onlyPublished = false) {
        const User = require('../models/User');

        const where = onlyPublished ? { status: 'Active' } : {};
        // NO tenant filter — courses are shared/global
        const courses = await Course.findAll({ where, order: [['createdAt', 'DESC']] });

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
                instructorAvatar,
                category: course.subject,
                // Show creator info to all admins
                createdByAdminName: course.createdByAdminName || 'Unknown Admin',
            };
        }));
    }

    async getCoursesByTeacher(teacherId, tenantId = null) {
        const where = { teacherId };
        // For teacher's own courses, no tenant filter needed (teacher sees all their courses)
        const courses = await Course.findAll({ where });
        return courses.map(c => ({ ...c.toJSON(), category: c.subject }));
    }

    async getCoursesByStudent(studentId) {
        const Enrollment = require('../models/Enrollment');
        const enrollments = await Enrollment.findAll({ where: { userId: studentId } });
        const courseIds = enrollments.map(e => e.courseId);
        const courses = await Course.findAll({ where: { id: courseIds } });
        return courses.map(c => ({ ...c.toJSON(), category: c.subject }));
    }

    // Fetch course (global) + ONLY the requesting tenant's modules/lessons
    async getCourseById(id, tenantId = null) {
        const User = require('../models/User');
        const Module = require('../models/Module');
        const Lesson = require('../models/Lesson');

        // Fetch the course globally (no tenant filter on course itself)
        const course = await Course.findOne({
            where: { id },
            include: [
                {
                    model: Module,
                    as: 'courseModules',
                    // Only include THIS tenant's modules
                    where: tenantId ? { tenantId } : { tenantId: null },
                    required: false,
                    include: [{
                        model: Lesson,
                        as: 'lessons',
                        order: [['lessonOrder', 'ASC']]
                    }]
                }
            ],
            order: [
                [{ model: Module, as: 'courseModules' }, 'moduleOrder', 'ASC'],
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
            instructorAvatar,
            category: course.subject,
            createdByAdminName: course.createdByAdminName || 'Unknown Admin',
        };
    }

    async createCourse(courseData, createdByUser = null, tenantId = null, creatorName = null) {
        const Notification = require('../models/Notification');
        const User = require('../models/User');

        const slug = generateSlug(courseData.title || 'course');

        // Resolve creator name if not provided
        let adminName = creatorName;
        if (!adminName && createdByUser) {
            const creator = await User.findByPk(createdByUser);
            adminName = creator?.name || 'Admin';
        }

        const data = {
            title: courseData.title,
            subject: courseData.subject || courseData.category || 'General',
            description: courseData.description || courseData.subtitle || '',
            detailedDescription: courseData.detailedDescription || '',
            thumbnail: courseData.thumbnail || null,
            teacherId: courseData.teacherId || null,
            price: courseData.price || 0,
            slug,
            status: courseData.status || 'Draft',
            createdBy: createdByUser || null,
            createdByAdminName: adminName || 'Admin',
            level: courseData.level || 'Beginner',
            tenantId: tenantId || null   // stored for creator-ownership check
        };

        const course = await Course.create(data);

        if (data.teacherId) {
            const teacher = await User.findByPk(data.teacherId);
            if (teacher) {
                await Notification.create({
                    userId: data.teacherId,
                    title: `📚 New Course Assigned: ${data.title}`,
                    message: `${adminName || 'Admin'} has assigned you as the teacher for "${data.title}".`,
                    type: 'info',
                    referenceId: course.id,
                    read: false,
                    role: 'Teacher'
                });
            }
        }

        return { ...course.toJSON(), category: course.subject };
    }

    // Only course creator or SuperAdmin can update core course details
    async updateCourse(id, updateData, userId = null, userRole = null) {
        const Notification = require('../models/Notification');
        const User = require('../models/User');

        const course = await Course.findByPk(id);
        if (!course) return null;

        // Creator-only check: only the admin who created the course can edit it
        if (userRole !== 'SuperAdmin' && course.createdBy && course.createdBy !== userId) {
            const err = new Error('Forbidden: only the course creator can edit this course');
            err.status = 403;
            throw err;
        }

        delete updateData.tenantId;         // never allow tenant reassignment
        delete updateData.createdBy;        // never allow creator reassignment
        delete updateData.createdByAdminName;

        const prevTeacherId = course.teacherId;
        if (updateData.category && !updateData.subject) updateData.subject = updateData.category;
        if (updateData.subtitle && !updateData.description) updateData.description = updateData.subtitle;

        const updated = await course.update(updateData);

        if (updateData.teacherId && updateData.teacherId !== prevTeacherId) {
            await Notification.create({
                userId: updateData.teacherId,
                title: `📚 Course Assigned: ${updated.title}`,
                message: `You have been assigned as the teacher for "${updated.title}".`,
                type: 'info',
                referenceId: id,
                read: false,
                role: 'Teacher'
            });
        }

        return { ...updated.toJSON(), category: updated.subject };
    }

    // Only course creator or SuperAdmin can delete
    async deleteCourse(id, userId = null, userRole = null) {
        const course = await Course.findByPk(id);
        if (!course) return false;

        if (userRole !== 'SuperAdmin' && course.createdBy && course.createdBy !== userId) {
            const err = new Error('Forbidden: only the course creator can delete this course');
            err.status = 403;
            throw err;
        }

        await course.destroy();
        return true;
    }
}

module.exports = new CourseService();

