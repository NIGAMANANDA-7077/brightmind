const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all users
router.get('/', userController.getAllUsers);

// Get user stats
router.get('/stats', userController.getUserStats);

// Get monthly analytics
router.get('/analytics/monthly', userController.getMonthlyAnalytics);

// Teacher Dashboard Stats
router.get('/teacher/:teacherId/stats', userController.getTeacherDashboardStats);

// Teacher's enrolled students
router.get('/teacher/:teacherId/students', userController.getTeacherStudents);

// Recent Activity
router.get('/activity', userController.getRecentActivity);

// Create user
router.post('/', userController.createUser);

// Update user status
router.patch('/:id/status', userController.updateUserStatus);

// Update full user details
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
