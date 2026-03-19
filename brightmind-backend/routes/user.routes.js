const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// ─── Admin: Create Student / Teacher (protected) ──────────────────────────
router.post('/admin/create', protect, authorize('Admin'), userController.adminCreateUser);

// Get all users (protected — tenant isolation requires req.user)
router.get('/', protect, userController.getAllUsers);

// Theme preference (protected — any authenticated role)
router.get('/theme', protect, userController.getThemePreference);
router.put('/theme', protect, userController.updateThemePreference);

// Get user stats (protected)
router.get('/stats', protect, userController.getUserStats);

// Get monthly analytics (protected)
router.get('/analytics/monthly', protect, userController.getMonthlyAnalytics);

// Teacher Dashboard Stats (protected)
router.get('/teacher/:teacherId/stats', protect, userController.getTeacherDashboardStats);

// Teacher's enrolled students (protected)
router.get('/teacher/:teacherId/students', protect, userController.getTeacherStudents);

// Recent Activity (protected)
router.get('/activity', protect, userController.getRecentActivity);

// Create user (protected — tenantId injected from req.user)
router.post('/', protect, userController.createUser);

// User Dashboard (batch-scoped content)
router.get('/:id/dashboard', protect, userController.getDashboard);

// Update user status (protected)
router.patch('/:id/status', protect, userController.updateUserStatus);

// Update full user details (Admin only)
router.put('/:id', protect, authorize('Admin'), userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', protect, authorize('Admin'), userController.deleteUser);

module.exports = router;
