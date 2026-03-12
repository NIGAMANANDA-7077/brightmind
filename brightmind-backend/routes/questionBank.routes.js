const express = require('express');
const router = express.Router();
const questionBankController = require('../controllers/questionBankController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All question bank operations are for Teachers and Admins
router.use(protect);
router.use(authorize('Teacher', 'Admin'));

router.post('/', questionBankController.createQuestion);
router.get('/', questionBankController.getQuestions);
router.get('/topics', questionBankController.getTopics);
router.put('/:id', questionBankController.updateQuestion);
router.delete('/:id', questionBankController.deleteQuestion);

module.exports = router;
