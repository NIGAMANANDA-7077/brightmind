const fs = require('fs');
const sequelize = require('../config/db');

async function checkLogic(studentEmail) {
    try {
        const [users] = await sequelize.query(`SELECT id FROM Users WHERE email = '${studentEmail}'`);
        if (!users.length) return;
        const studentId = users[0].id;
        
        let output = `Student ID: ${studentId}\n`;

        // 1. Get Enrollments
        const [enrollments] = await sequelize.query(`SELECT courseId FROM Enrollments WHERE studentId = '${studentId}'`);
        const courseIdsFromEnrollments = enrollments.map(e => e.courseId);
        
        // 2. Get Batches
        const [batches] = await sequelize.query(`
            SELECT b.courseId, bs.batchId 
            FROM BatchStudents bs 
            JOIN Batches b ON bs.batchId = b.id 
            WHERE bs.studentId = '${studentId}'
        `);
        const batchIds = batches.map(b => b.batchId);
        const courseIdsFromBatches = batches.map(b => b.courseId).filter(Boolean);
        
        const allCourseIds = [...new Set([...courseIdsFromBatches, ...courseIdsFromEnrollments])];
        
        output += `All Course IDs: ${JSON.stringify(allCourseIds)}\n`;
        output += `Batch IDs: ${JSON.stringify(batchIds)}\n`;

        // 3. Get Exams directly using exact SQL logic that matches Sequelize OP.or
        let examsQuery = `SELECT * FROM Exams WHERE status = 'Active' AND (`;
        let conditions = [];
        if (batchIds.length > 0) {
            conditions.push(`batchId IN ('${batchIds.join("','")}')`);
        }
        if (allCourseIds.length > 0) {
            conditions.push(`(batchId IS NULL AND courseId IN ('${allCourseIds.join("','")}'))`);
        }
        
        if (conditions.length === 0) {
            output += "No active courses or batches found.\n";
        } else {
            examsQuery += conditions.join(' OR ') + `)`;
            const [exams] = await sequelize.query(examsQuery);
            output += `Backend returns ${exams.length} exams.\n`;
            
            // 4. Get Results
            const [results] = await sequelize.query(`SELECT examId FROM ExamResults WHERE studentId = '${studentId}'`);
            const takenExamIds = new Set(results.map(r => r.examId));
            
            output += `Student has ${takenExamIds.size} results.\n`;
            
            const availableExams = exams.filter(e => !takenExamIds.has(e.id));
            output += `Frontend available exams: ${availableExams.length}\n`;
            
            if (availableExams.length === 0) {
                output += "REASON: All returned exams are in takenExamIds.\n";
            } else {
                availableExams.forEach(e => {
                    output += `Available Exam: ${e.title} (ID: ${e.id})\n`;
                });
            }
        }
        
        fs.writeFileSync('api_logic_output.txt', output);
        console.log("Wrote to api_logic_output.txt");

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkLogic('priya@student.com');
