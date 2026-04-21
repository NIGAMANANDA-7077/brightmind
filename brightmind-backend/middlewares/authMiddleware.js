const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

            // Get user from the token
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, no user data' });
        }

        const userRole = String(req.user.role || '').trim().toLowerCase();

        // 🌟 SuperAdmin bypass: SuperAdmin has FULL ACCESS to all modules
        if (userRole === 'superadmin') {
            return next();
        }

        const allowedRoles = roles.map(r => String(r || '').trim().toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            console.warn(`[AUTH] Unauthorized: User Role="${req.user.role}", Required Roles="${roles}"`);
            return res.status(403).json({ success: false, message: 'Your user role is not authorized to access this route' });
        }
        next();
    };
};

const ensureBatchAccess = (batchIdParam = 'batchId') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }
            const userRole = req.user.role?.toLowerCase();
            // Admins and SuperAdmins bypass batch checks
            if (userRole === 'admin' || userRole === 'superadmin') return next();

            const batchId = req.params[batchIdParam] || req.body[batchIdParam] || req.query[batchIdParam];
            if (!batchId) return next();

            if (userRole === 'student') {
                const BatchStudent = require('../models/BatchStudent');
                const record = await BatchStudent.findOne({ where: { batchId, studentId: req.user.id } });
                if (!record) {
                    return res.status(403).json({ success: false, message: 'Access denied: you are not enrolled in this batch.' });
                }
            } else if (userRole === 'teacher') {
                const Batch = require('../models/Batch');
                const batch = await Batch.findOne({ where: { id: batchId, teacherId: req.user.id } });
                if (!batch) {
                    return res.status(403).json({ success: false, message: 'Access denied: you are not assigned to this batch.' });
                }
            }
            next();
        } catch (err) {
            console.error('[ensureBatchAccess]', err.message);
            res.status(500).json({ success: false, message: 'Server error checking batch access' });
        }
    };
};

module.exports = { protect, authorize, ensureBatchAccess };
