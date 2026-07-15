const express = require('express');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { startAttempt, updateStep, submitAttempt } = require('../controllers/attemptController');

const router = express.Router();

// Toàn bộ route làm bài yêu cầu đã xác thực và có role 'student'
router.use(authenticate, requireRole('student'));

// POST /api/attempts/start
router.post('/start', startAttempt);

// PUT /api/attempts/update-step
router.put('/update-step', updateStep);

// POST /api/attempts/submit
router.post('/submit', submitAttempt);

module.exports = router;
