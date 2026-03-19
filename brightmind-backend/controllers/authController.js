const authService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        const userPayload = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            user: userPayload
        });
    } catch (error) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        const userPayload = await authService.loginUser(email, password, role);
        res.json({
            success: true,
            user: userPayload
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        if (error.message === 'Account suspended') {
            return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact your administrator.' });
        }
        if (error.message === 'Role mismatch') {
            return res.status(401).json({ success: false, message: 'Invalid role selected for this account' });
        }
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};

exports.studentLogin = async (req, res, next) => {
    try {
        const { studentId, password } = req.body;
        if (!studentId || !password)
            return res.status(400).json({ success: false, message: 'Student ID and password are required' });

        const userPayload = await authService.loginWithStudentId(
            studentId.trim().toUpperCase(),
            password
        );
        res.json({ success: true, user: userPayload });
    } catch (error) {
        if (error.message === 'Account suspended') {
            return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact your administrator.' });
        }
        if (error.message === 'Invalid student ID or password') {
            return res.status(401).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

exports.getMe = async (req, res, next) => {
    try {
        if (req.user) {
            res.json({
                success: true,
                user: req.user
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};
