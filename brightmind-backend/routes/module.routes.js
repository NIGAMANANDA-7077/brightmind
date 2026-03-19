const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, moduleController.createModule);
router.get('/:courseId', protect, moduleController.getModulesByCourse);
router.put('/:id', protect, moduleController.updateModule);
router.delete('/:id', protect, moduleController.deleteModule);

module.exports = router;
