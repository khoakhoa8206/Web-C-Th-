/**
 * Bọc các hàm controller async để tự động bắt lỗi và chuyển cho errorHandler,
 * tránh phải viết try/catch lặp lại ở mọi controller.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware xử lý lỗi tập trung — đặt cuối cùng trong server.js.
 */
function errorHandler(err, req, res, next) {
  console.error('[ErrorHandler]', err);

  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message = err.message || 'Đã xảy ra lỗi không xác định trên server.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/**
 * Middleware xử lý route không tồn tại (404).
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`,
  });
}

/** Helper tạo lỗi có statusCode để ném ra trong controller: throw new ApiError(400, '...') */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { asyncHandler, errorHandler, notFoundHandler, ApiError };
