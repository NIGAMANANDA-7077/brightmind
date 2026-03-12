const fs = require('fs');
const sequelize = require('../config/db');
const { Exam, Enrollment, BatchStudent, User, Course } = require('../models/associations');

async function debugVisibility(studentEmail) {
    console.log(`--- Debugging Visibility for ${studentEmail} ---`);
    try {
        const student = await User.findOne({ where: { email: studentEmail } });
        if (!student) {
            console.log('Student not found');
            return;
        }
        console.log(`Student ID: ${student.id}`);

        // 1. Direct Enrollments
        const enrollments = await Enrollment.findAll({ where: { studentId: student.id } });
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        console.log(`Enrolled Course IDs: ${JSON.stringify(enrolledCourseIds)}`);

        // 2. Batch Memberships
        const memberships = await BatchStudent.findAll({ where: { studentId: student.id } });
        const batchIds = memberships.map(m => m.batchId);
        console.log(`Enrolled Batch IDs: ${JSON.stringify(batchIds)}`);

        // 3. Available Exams
        const allExams = await Exam.findAll({
            include: [{ model: Course, as: 'course', attributes: ['title'] }]
        });
        
        let outputLog = `--- Debugging Visibility for ${studentEmail} ---\n`;
        outputLog += `Student ID: ${student.id}\n`;
        outputLog += `Enrolled Course IDs: ${JSON.stringify(enrolledCourseIds)}\n`;
        outputLog += `Enrolled Batch IDs: ${JSON.stringify(batchIds)}\n`;
        outputLog += '\n--- All Exams in DB ---\n';

        allExams.forEach(e => {
            const isCourseMatch = e.batchId === null && enrolledCourseIds.includes(e.courseId);
            const isBatchMatch = batchIds.includes(e.batchId);
            const isVisible = (isCourseMatch || isBatchMatch) && e.status === 'Active';
            
            outputLog += `ID: ${e.id}\n`;
            outputLog += `Title: ${e.title}\n`;
            outputLog += `Status: ${e.status}\n`;
            outputLog += `CourseId: ${e.courseId} (${e.course?.title})\n`;
            outputLog += `BatchId: ${e.batchId}\n`;
            outputLog += `Match Logic -> CourseMatch: ${isCourseMatch}, BatchMatch: ${isBatchMatch}, FinalVisible: ${isVisible}\n`;
            outputLog += '-------------------------\n';
        });
        
        fs.writeFileSync('debug_output_clean.txt', outputLog);
        console.log("Successfully wrote to debug_output_clean.txt");

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

// Priya Patel's email seems to be priya@example.com based on earlier logs or standard patterns
// If unknown, I'll search for it first.
debugVisibility('priya@student.com');
