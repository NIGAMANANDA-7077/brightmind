const Exam = require('../models/Exam');
const BatchStudent = require('../models/BatchStudent');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const { Op } = require('sequelize');

async function testVisibilityLogic() {
    const studentEmail = 'student@example.com';
    try {
        const User = require('../models/User');
        console.log('User model:', typeof User);
        const student = await User.findOne({ where: { email: studentEmail } });
        if (!student) {
            console.log('Student not found');
            return;
        }
        
        const studentId = student.id;
        console.log(`Testing visibility for student: ${student.name} (${studentId})`);

        // Replicate logic from controller
        const enrollments = await BatchStudent.findAll({ 
            where: { studentId },
            include: [{ model: Batch, as: 'batch', attributes: ['courseId'] }]
        });
        
        const batchIds = enrollments.map(e => e.batchId);
        const courseIds = [...new Set(enrollments.map(e => e.batch?.courseId).filter(Boolean))];
        
        console.log('Enrolled Batch IDs:', batchIds);
        console.log('Enrolled Course IDs:', courseIds);

        const exams = await Exam.findAll({
            where: {
                status: 'Active',
                [Op.or]: [
                    { batchId: { [Op.in]: batchIds } },
                    { 
                        batchId: null, 
                        courseId: { [Op.in]: courseIds } 
                    }
                ]
            },
            include: [{ model: Course, as: 'course', attributes: ['title'] }],
            order: [['createdAt', 'DESC']]
        });

        console.log(`Visible Exams Count: ${exams.length}`);
        exams.forEach(e => {
            console.log(`- ${e.title} (Course: ${e.course?.title}, Batch: ${e.batchId || 'All Batches'})`);
        });

        if (exams.length > 0) {
            console.log('✅ Visibility logic confirmed via DB check.');
        } else {
            console.log('⚠️ No active exams found for this student. Checking if any active exams exist globally...');
            const globalActive = await Exam.count({ where: { status: 'Active' } });
            console.log(`Global active exams: ${globalActive}`);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

testVisibilityLogic();
