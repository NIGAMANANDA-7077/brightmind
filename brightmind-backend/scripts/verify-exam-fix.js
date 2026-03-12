const axios = require('axios');

async function verifyFix() {
    const baseUrl = 'http://localhost:5000/api';
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'teacher@example.com',
            password: 'password123'
        });
        const token = loginRes.data.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Login success.');

        // 1. Create Question (Using Backend Field Names for Direct API Call)
        console.log('Creating Question...');
        const qRes = await axios.post(`${baseUrl}/question-bank`, {
            questionText: 'Test Question ' + Date.now(),
            questionType: 'MCQ',
            topic: 'Science',
            difficulty: 'Easy',
            marks: 5,
            options: [
                { optionText: 'Opt 1', isCorrect: true },
                { optionText: 'Opt 2', isCorrect: false }
            ],
            explanation: 'Test explanation'
        }, config);
        
        const questionId = qRes.data.id;
        console.log('Question created:', questionId);

        // 2. Create Exam with Section
        console.log('Creating Exam with sections...');
        const examIdStr = 'a10d16ff-cbfa-43e1-85af-602327b0d74a'; // Use same valid ID
        const examRes = await axios.post(`${baseUrl}/exams`, {
            title: 'Exam ' + Date.now(),
            courseId: examIdStr,
            examType: 'Quiz',
            duration: 30,
            totalMarks: 5,
            sections: [
                { name: 'Core Section', marksPerQuestion: 5, questions: [questionId] }
            ]
        }, config);
        const examId = examRes.data.exam.id;
        console.log('Exam created:', examId);

        // 3. Verify
        console.log('Fetching Exam details...');
        const fetchRes = await axios.get(`${baseUrl}/exams/${examId}`, config);
        const exam = fetchRes.data;
        console.log('Exam fetched. Questions count:', exam.examQuestions.length);
        
        const hasSection = exam.examQuestions.some(eq => eq.sectionName === 'Core Section');
        if (hasSection) {
            console.log('✅ SUCCESS: Section mapping verified.');
        } else {
            console.error('❌ FAILURE: Section name missing in ExamQuestion.');
        }

    } catch (err) {
        console.error('Verification Error:', err.response ? err.response.data : err.message);
    }
}

verifyFix();
