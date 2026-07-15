const { verifyToken } = require('../utils/jwt');

/**
 * Xác thực JWT gửi kèm header: Authorization: Bearer <token>
 * Gắn payload đã giải mã vào req.user để các controller phía sau dùng.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Thiếu hoặc sai định dạng token xác thực (Authorization: Bearer <token>).',
    });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
}

/**
 * Phân quyền theo role. Dùng: requireRole('teacher') hoặc requireRole('student', 'teacher')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền truy cập tài nguyên này. Yêu cầu vai trò: ${allowedRoles.join(', ')}.`,
      });
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
