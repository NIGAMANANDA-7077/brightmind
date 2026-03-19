const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const guard = [protect, authorize('Admin', 'SuperAdmin')];

// Dashboard
router.get('/dashboard', ...guard, adminController.getDashboard);

// Profile
router.get('/profile',    ...guard, adminController.getProfile);
router.patch('/profile',  ...guard, adminController.updateProfile);

// System Settings
router.get('/settings/system',   ...guard, adminController.getSystemSettings);
router.patch('/settings/system', ...guard, adminController.updateSystemSettings);

// Security Settings
router.get('/settings/security',   ...guard, adminController.getSecuritySettings);
router.patch('/settings/security', ...guard, adminController.updateSecuritySettings);

module.exports = router;
