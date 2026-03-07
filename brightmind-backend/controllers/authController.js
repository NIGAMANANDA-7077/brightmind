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
        const { email, password } = req.body;
        const userPayload = await authService.loginUser(email, password);
        res.json({
            success: true,
            user: userPayload
        });
    } catch (error) {
        if (error.message === 'Invalid email or password') {
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
