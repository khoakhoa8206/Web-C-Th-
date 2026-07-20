const express = require('express');
const { login, teacherLogin } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/login — học sinh đăng nhập bằng họ tên
router.post('/login', login);

// POST /api/auth/teacher-login — giáo viên đăng nhập bằng mật khẩu
router.post('/teacher-login', teacherLogin);

module.exports = router;
