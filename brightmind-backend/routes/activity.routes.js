const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('Admin'), activityController.getActivities);

module.exports = router;
