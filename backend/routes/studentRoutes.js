const express = require('express');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { getStudentSessions, getSessionExercises } = require('../controllers/studentController');

const router = express.Router();

// Toàn bộ route học sinh yêu cầu đã xác thực và có role 'student'
router.use(authenticate, requireRole('student'));

// GET /api/student/sessions — danh sách session PUBLISHED của lớp học sinh
router.get('/sessions', getStudentSessions);

// GET /api/student/sessions/:session_id/exercises — nội dung bài tập
router.get('/sessions/:session_id/exercises', getSessionExercises);

module.exports = router;
