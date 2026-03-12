const sequelize = require('../config/db');
const { Exam, Enrollment, BatchStudent, User, Course, ExamResult, Batch } = require('../models/associations');
const { Op } = require('sequelize');

async function checkStudentExamsAPI(studentEmail) {
    console.log(`--- Checking API Logic for ${studentEmail} ---`);
    try {
        const student = await User.findOne({ where: { email: studentEmail } });
        if (!student) return console.log('Student not found');
        const studentId = student.id;

        // 1. Logic from getStudentExams
        const batchEnrollments = await BatchStudent.findAll({ 
            where: { studentId },
            include: [{ model: Batch, as: 'batch', attributes: ['courseId'] }]
        });
        
        const directEnrollments = await Enrollment.findAll({
            where: { studentId },
            attributes: ['courseId']
        });

        const batchIds = batchEnrollments.map(e => e.batchId);
        const courseIdsFromBatches = batchEnrollments.map(e => e.batch?.courseId).filter(Boolean);
        const courseIdsFromEnrollments = directEnrollments.map(e => e.courseId);
        
        const allCourseIds = [...new Set([...courseIdsFromBatches, ...courseIdsFromEnrollments])];

        const exams = await Exam.findAll({
            where: {
                status: 'Active',
                [Op.or]: [
                    { batchId: { [Op.in]: batchIds } },
                    { 
                        batchId: null, 
                        courseId: { [Op.in]: allCourseIds } 
                    }
                ]
            },
            include: [{ model: Course, as: 'course', attributes: ['title'] }],
            order: [['createdAt', 'DESC']]
        });

        console.log(`Backend API would return ${exams.length} exams.`);

        // 2. Logic from getStudentResults
        const results = await ExamResult.findAll({
            where: { studentId },
            attributes: ['examId']
        });

        const takenExamIds = new Set(results.map(r => r.examId));
        console.log(`Student has ${takenExamIds.size} results.`);

        // 3. Frontend filtering logic
        const availableExams = exams.filter(e => !takenExamIds.has(e.id));
        console.log(`Frontend would show ${availableExams.length} available exams.`);

        if (availableExams.length === 0) {
            console.log("REASON: All exams returned by backend are already in takenExamIds.");
            console.log("Exams returned by backend:", exams.map(e => e.id));
            console.log("Taken exam IDs:", Array.from(takenExamIds));
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkStudentExamsAPI('priya@student.com');
