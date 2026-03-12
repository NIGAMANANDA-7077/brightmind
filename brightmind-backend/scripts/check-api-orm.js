const fs = require('fs');
const sequelize = require('../config/db');
const { Exam, Enrollment, BatchStudent, User, Course, ExamResult, Batch } = require('../models/associations');
const { Op } = require('sequelize');

async function checkLogic(studentEmail) {
    let output = '';
    const log = (msg) => {
        output += msg + '\n';
        console.log(msg);
    };

    try {
        const student = await User.findOne({ where: { email: studentEmail } });
        if (!student) return log('Student not found');
        const studentId = student.id;
        log(`Student ID: ${studentId}`);

        // --- EXAM CONTROLLER LOGIC ---
        // Find enrolled batches via User
        const studentWithBatches = await User.findByPk(studentId, {
            include: [{ model: Batch, as: 'enrolledBatches', attributes: ['id', 'courseId'] }]
        });
        
        const directEnrollments = await Enrollment.findAll({
            where: { studentId },
            attributes: ['courseId']
        });

        const batchIds = studentWithBatches ? studentWithBatches.enrolledBatches.map(b => b.id) : [];
        const courseIdsFromBatches = studentWithBatches ? studentWithBatches.enrolledBatches.map(b => b.courseId).filter(Boolean) : [];
        const courseIdsFromEnrollments = directEnrollments.map(e => e.courseId);
        
        const allCourseIds = [...new Set([...courseIdsFromBatches, ...courseIdsFromEnrollments])];
        log(`Extracted Course IDs: ${JSON.stringify(allCourseIds)}`);
        log(`Extracted Batch IDs: ${JSON.stringify(batchIds)}`);

        // Get Exams
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

        log(`\nBackend exams fetched: ${exams.length}`);
        
        // --- RESULTS ROUTE LOGIC ---
        const resultsRes = await ExamResult.findAll({
            where: { studentId }
        });
        const takenExamIds = new Set(resultsRes.map(r => r.examId));
        log(`Student has ${takenExamIds.size} results.`);

        // --- FRONTEND LOGIC ---
        const availableExams = exams.filter(e => !takenExamIds.has(e.id));
        log(`\nFrontend filtered available exams: ${availableExams.length}`);
        
        if (availableExams.length === 0) {
            log("ALL matched exams are in takenExamIds!");
            exams.forEach(e => {
                log(`- Exam fetched: ${e.title} (${e.id}) [Taken: ${takenExamIds.has(e.id)}]`);
            });
        } else {
            availableExams.forEach(e => {
                log(`- Available Exam: ${e.title} (${e.id})`);
            });
        }

        fs.writeFileSync('diag_result.txt', output);
        log("Saved to diag_result.txt");

    } catch (err) {
        log(`ERROR: ${err.message}`);
        log(err.stack);
        fs.writeFileSync('diag_result.txt', output);
    } finally {
        process.exit(0);
    }
}

checkLogic('priya@student.com');
