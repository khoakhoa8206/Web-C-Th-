const express = require('express');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { getStudentSessions, getSessionExercises, getMyAttempts } = require('../controllers/studentController');

const router = express.Router();

// Toàn bộ route học sinh yêu cầu đã xác thực và có role 'student'
router.use(authenticate, requireRole('student'));

// GET /api/student/sessions — danh sách session PUBLISHED của mọi lớp (mục 9)
router.get('/sessions', getStudentSessions);

// GET /api/student/sessions/:session_id/exercises — nội dung bài tập
router.get('/sessions/:session_id/exercises', getSessionExercises);

// GET /api/student/sessions/:session_id/attempts — lịch sử làm bài của học sinh (mục 7)
router.get('/sessions/:session_id/attempts', getMyAttempts);

module.exports = router;
