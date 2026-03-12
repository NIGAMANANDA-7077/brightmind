const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'brightmind_super_secret_key_change_this_in_production';
const ADMIN_ID = '5cf330e7-4b7b-4f27-9b56-311730a2672a';
const STUDENT_ID = '5bd81f28-a94b-4443-91b8-2023dfbcde16';

function generateToken(id) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
}

async function verifyStudentVisibility() {
    const baseUrl = 'http://localhost:5000/api';
    try {
        console.log('Generating Manual Tokens...');
        const adminToken = generateToken(ADMIN_ID);
        const studentToken = generateToken(STUDENT_ID);
        
        const adminConfig = { headers: { Authorization: `Bearer ${adminToken}` } };
        const studentConfig = { headers: { Authorization: `Bearer ${studentToken}` } };

        // 1. Get a course and create an exam if none exists
        console.log('Fetching admin exams...');
        const examsRes = await axios.get(`${baseUrl}/exams/teacher`, adminConfig);
        const exams = examsRes.data;
        
        let examId;
        if (exams.length > 0) {
            examId = exams[0].id;
            console.log(`Using existing exam: ${exams[0].title} (ID: ${examId})`);
        } else {
            console.log('Creating a test exam...');
            const coursesRes = await axios.get(`${baseUrl}/courses`, adminConfig);
            if (!coursesRes.data || coursesRes.data.length === 0) {
                throw new Error('No courses found to create exam');
            }
            const courseId = coursesRes.data[0].id;
            const createRes = await axios.post(`${baseUrl}/exams`, {
                title: 'Student Visibility Test 2',
                courseId: courseId,
                examType: 'Quiz',
                duration: 30,
                totalMarks: 50,
                status: 'Active'
            }, adminConfig);
            examId = createRes.data.exam.id;
        }

        // 2. Generate paper for the exam
        console.log('Generating random paper...');
        const genRes = await axios.post(`${baseUrl}/exams/${examId}/generate`, {
            easyCount: 2,
            mediumCount: 1,
            hardCount: 0
        }, adminConfig);
        console.log(genRes.data.message);

        // 3. Fetch student exams
        console.log('Fetching student exams...');
        const studentExamsRes = await axios.get(`${baseUrl}/exams/student`, studentConfig);
        const studentExams = studentExamsRes.data;
        
        console.log(`Found ${studentExams.length} exams for student.`);
        const found = studentExams.find(e => e.id === examId);
        
        if (found) {
            console.log('✅ SUCCESS: Exam is visible to student!');
        } else {
            console.log('❌ FAILED: Exam is NOT visible to student.');
            // Let's check why - check courses/batches
            console.log('Checking enrollment for student...');
            const studentRes = await axios.get(`${baseUrl}/auth/me`, studentConfig);
            console.log('Student Batch:', studentRes.data.user.batchId);
            
            const examDetailRes = await axios.get(`${baseUrl}/exams/${examId}`, adminConfig);
            console.log('Exam Course ID:', examDetailRes.data.courseId);
            console.log('Exam Batch ID:', examDetailRes.data.batchId);
        }

    } catch (err) {
        console.error('Verification Error:', err.response ? err.response.data : err.message);
    }
}

verifyStudentVisibility();
