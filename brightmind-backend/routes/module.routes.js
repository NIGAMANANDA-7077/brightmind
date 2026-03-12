const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// POST a new module
router.post('/', moduleController.createModule);

// GET modules for a specific course
router.get('/:courseId', moduleController.getModulesByCourse);

// PUT update a module
router.put('/:id', moduleController.updateModule);

// DELETE a module
router.delete('/:id', moduleController.deleteModule);

module.exports = router;
