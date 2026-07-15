const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('[utils/jwt] Thiếu JWT_SECRET trong biến môi trường.');
}

/**
 * Sinh JWT cho học sinh.
 * Payload chứa student_id, class_id, role => dùng để middleware xác thực & phân quyền.
 */
function signStudentToken({ student_id, class_id, full_name }) {
  return jwt.sign(
    { student_id, class_id, full_name, role: 'student' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Sinh JWT cho giáo viên (nếu hệ thống có luồng login riêng cho giáo viên).
 */
function signTeacherToken({ teacher_id, full_name }) {
  return jwt.sign(
    { teacher_id, full_name, role: 'teacher' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signStudentToken, signTeacherToken, verifyToken };
