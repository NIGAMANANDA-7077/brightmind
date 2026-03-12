const axios = require('axios');

async function testApi() {
    const baseUrl = 'http://localhost:5000/api';
    try {
        // 0. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'teacher@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 1. Get all courses
        console.log('Fetching courses...');
        const coursesRes = await axios.get(`${baseUrl}/courses`, config);
        const courseId = coursesRes.data[0].id;
        console.log(`Testing with Course ID: ${courseId}`);

        // 2. Fetch course details
        console.log(`Fetching course details for ${courseId}...`);
        const courseDetailRes = await axios.get(`${baseUrl}/courses/${courseId}`, config);
        console.log('Course details fetched successfully.');

        // 3. Add a module
        console.log('Attempting to add a module...');
        const moduleRes = await axios.post(`${baseUrl}/modules`, {
            courseId: courseId,
            moduleTitle: 'Test Verification Module',
            moduleOrder: 99
        }, config);
        const moduleId = moduleRes.data.id;
        console.log('Module added successfully:', moduleId);

        // 4. Add a lesson
        console.log('Attempting to add a lesson...');
        const lessonRes = await axios.post(`${baseUrl}/lessons`, {
            moduleId: moduleId,
            lessonTitle: 'Test Verification Lesson',
            lessonOrder: 0,
            duration: '5:00'
        }, config);
        console.log('Lesson added successfully:', lessonRes.data.id);

        // 5. Test Forum
        console.log('Testing Forum API...');
        const forumRes = await axios.get(`${baseUrl}/forum`, config);
        console.log('Forum API returned successfully.');

        // 6. Test Question Bank
        console.log('Testing Question Bank...');
        const qRes = await axios.post(`${baseUrl}/question-bank`, {
            text: 'What is 2+2?',
            type: 'MCQ',
            topic: 'Math',
            difficulty: 'Easy',
            marks: 4,
            options: ['2', '3', '4', '5'],
            correctAnswer: '4',
            explanation: 'Basic addition'
        }, config);
        const questionId = qRes.data.id;
        console.log('Question created successfully:', questionId);

        // 7. Test Exams with Sections
        console.log('Testing Exams API with sections...');
        const examRes = await axios.post(`${baseUrl}/exams`, {
            title: 'Final Test Exam',
            courseId: courseId,
            examType: 'Final Exam',
            duration: 120,
            totalMarks: 4,
            sections: [
                { name: 'Math Section', marksPerQuestion: 4, questions: [questionId] }
            ]
        }, config);
        const examId = examRes.data.exam.id;
        console.log('Exam created successfully:', examId);

        // 8. Fetch Exam and Verify Sections
        console.log('Verifying exam structure...');
        const fetchExamRes = await axios.get(`${baseUrl}/exams/${examId}`, config);
        const examQuestions = fetchExamRes.data.examQuestions;
        if (examQuestions.some(eq => eq.sectionName === 'Math Section')) {
            console.log('✅ Section mapping verified.');
        } else {
            console.error('❌ Section mapping failed.');
        }

        console.log('--- All API Tests Passed ---');

    } catch (err) {
        console.error('API Error:', err.response ? err.response.data : err.message);
    }
}

testApi();
