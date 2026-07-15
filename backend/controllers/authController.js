const supabase = require('../config/supabaseClient');
const { signStudentToken, signTeacherToken } = require('../utils/jwt');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

/**
 * POST /api/auth/login
 * Body: { full_name: "Nguyễn Văn A" }
 *
 * Đăng nhập đơn giản không mật khẩu (dùng trong lớp học): tìm học sinh theo full_name.
 * Nếu tồn tại -> sinh JWT chứa student_id, class_id, role.
 */
const login = asyncHandler(async (req, res) => {
  const { full_name } = req.body;

  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    throw new ApiError(400, 'Vui lòng cung cấp họ tên (full_name) hợp lệ.');
  }

  const cleanedName = full_name.trim();

  // Tìm kiếm không phân biệt hoa/thường để tránh học sinh gõ sai chữ hoa
  const { data: students, error } = await supabase
    .from('students')
    .select('id, full_name, class_id')
    .ilike('full_name', cleanedName);

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn Supabase: ${error.message}`);
  }

  if (!students || students.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy học sinh với họ tên này. Vui lòng liên hệ giáo viên để được thêm vào lớp.',
    });
  }

  if (students.length > 1) {
    // Trùng tên trong hệ thống -> cần định danh rõ hơn thay vì đoán bừa
    return res.status(409).json({
      success: false,
      message: 'Có nhiều học sinh trùng họ tên. Vui lòng liên hệ giáo viên để xác nhận lớp học của bạn.',
      candidates: students.map((s) => ({ id: s.id, class_id: s.class_id })),
    });
  }

  const student = students[0];

  const token = signStudentToken({
    student_id: student.id,
    class_id: student.class_id,
    full_name: student.full_name,
  });

  return res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công.',
    data: {
      token,
      student: {
        id: student.id,
        full_name: student.full_name,
        class_id: student.class_id,
      },
    },
  });
});

/**
 * POST /api/auth/teacher-login
 * Body: { password: "..." }
 *
 * Đăng nhập giáo viên bằng mật khẩu cố định từ env.
 * Trả JWT chứa role: 'teacher' để dùng cho toàn bộ teacher routes.
 */
const teacherLogin = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    throw new ApiError(400, 'Vui lòng cung cấp mật khẩu.');
  }

  const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD;
  if (!TEACHER_PASSWORD) {
    throw new ApiError(500, '[config] Chưa cấu hình TEACHER_PASSWORD trong biến môi trường.');
  }

  if (password !== TEACHER_PASSWORD) {
    throw new ApiError(401, 'Mật khẩu giáo viên không đúng.');
  }

  const token = signTeacherToken({ teacher_id: 'teacher', full_name: 'Giáo viên' });

  return res.status(200).json({
    success: true,
    message: 'Đăng nhập giáo viên thành công.',
    data: { token, role: 'teacher' },
  });
});

module.exports = { login, teacherLogin };

