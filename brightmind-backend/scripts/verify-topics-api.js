const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api';

async function verifyFixes() {
    console.log('--- Verifying Fixes ---');

    try {
        // 1. Verify Topics Endpoint
        console.log('Checking /question-bank/topics...');
        // We need a token, but let's see if it's reachable (it should return 401 if protect is working, which is good)
        try {
            const topicsRes = await axios.get(`${BACKEND_URL}/question-bank/topics`);
            console.log('Topics fetch successful (might be public if no 401):', topicsRes.data);
        } catch (err) {
            if (err.response?.status === 401) {
                console.log('Topics endpoint is protected (Correct)');
            } else {
                console.error('Topics endpoint error:', err.message);
            }
        }

        // 2. Search for res.data.exam in build files (if possible) - skipped

        console.log('--- Verification Script Finished ---');
    } catch (err) {
        console.error('Verification failed:', err.message);
    }
}

verifyFixes();
