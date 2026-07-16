const express = require('express');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { validateExercisesBody } = require('../middlewares/validateExercises');
const {
  generateExercises,
  updateExercises,
  publishSession,
} = require('../controllers/teacherController');
const { getClassDashboard } = require('../controllers/dashboardController');
const {
  getClasses,
  createClass,
  getStudents,
  createStudent,
  updateStudentRecord,
  deleteStudentRecord,
  getSessions,
  updateSession,
  deleteSession,
  getAttempts,
  deleteClass,
} = require('../controllers/teacherManageController');

const router = express.Router();

// Toàn bộ route giáo viên yêu cầu đã xác thực và có role 'teacher'
router.use(authenticate, requireRole('teacher'));

// --- AI Exercise generation ---
// POST /api/teacher/generate-exercises
router.post('/generate-exercises', generateExercises);

// PUT /api/teacher/update-exercises/:session_id
router.put('/update-exercises/:session_id', validateExercisesBody, updateExercises);

// PUT /api/teacher/publish-session/:session_id
router.put('/publish-session/:session_id', publishSession);

// --- Dashboard ---
// GET /api/teacher/dashboard/:class_id
router.get('/dashboard/:class_id', getClassDashboard);

// --- Classes ---
// GET /api/teacher/classes
router.get('/classes', getClasses);

// POST /api/teacher/classes
router.post('/classes', createClass);

// DELETE /api/teacher/classes/:id
router.delete('/classes/:id', deleteClass);

// --- Sessions ---
// GET /api/teacher/sessions?class_id=...
router.get('/sessions', getSessions);

// PUT /api/teacher/sessions/:id
router.put('/sessions/:id', updateSession);

// DELETE /api/teacher/sessions/:id
router.delete('/sessions/:id', deleteSession);

// --- Student CRUD ---
// GET /api/teacher/students?class_id=...
router.get('/students', getStudents);

// POST /api/teacher/students
router.post('/students', createStudent);

// PUT /api/teacher/students/:id
router.put('/students/:id', updateStudentRecord);

// DELETE /api/teacher/students/:id
router.delete('/students/:id', deleteStudentRecord);

// --- Attempts ---
// GET /api/teacher/attempts?session_id=...
router.get('/attempts', getAttempts);

module.exports = router;

