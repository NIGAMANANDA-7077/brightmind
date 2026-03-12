const axios = require('axios');

async function verifyAll() {
    const baseUrl = 'http://localhost:5000/api';
    try {
        console.log('Logging in as Admin/Teacher...');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'teacher@example.com',
            password: 'password123'
        });
        const token = loginRes.data.user.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Login success.');

        // 1. Verify /exams/results/all (Was 404)
        console.log('Testing /api/exams/results/all...');
        try {
            const resultsRes = await axios.get(`${baseUrl}/exams/results/all`, config);
            console.log('✅ /api/exams/results/all: SUCCESS (Status: ' + resultsRes.status + ')');
        } catch (e) {
            console.error('❌ /api/exams/results/all: FAILED', e.response ? e.response.status : e.message);
        }

        // 2. Verify /exams/teacher (Used in ExamsTab.jsx)
        console.log('Testing /api/exams/teacher...');
        try {
            const teacherExamsRes = await axios.get(`${baseUrl}/exams/teacher`, config);
            console.log('✅ /api/exams/teacher: SUCCESS (Count: ' + (teacherExamsRes.data.length || 0) + ')');
        } catch (e) {
            console.error('❌ /api/exams/teacher: FAILED', e.response ? e.response.status : e.message);
        }

        // 3. Verify /exams root (Used in AdminExamContext/Scheduler)
        console.log('Testing /api/exams...');
        try {
            const examsRes = await axios.get(`${baseUrl}/exams`, config);
            console.log('✅ /api/exams: SUCCESS (Count: ' + (examsRes.data.length || 0) + ')');
        } catch (e) {
            console.error('❌ /api/exams: FAILED', e.response ? e.response.status : e.message);
        }

    } catch (err) {
        console.error('Verification Prep Error:', err.response ? err.response.data : err.message);
    }
}

verifyAll();
