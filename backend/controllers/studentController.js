const supabase = require('../config/supabaseClient');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

/**
 * GET /api/student/sessions
 *
 * Lấy danh sách session PUBLISHED của lớp học sinh (class_id lấy từ JWT).
 * Học sinh chỉ thấy bài đã được giáo viên giao, không thấy DRAFT.
 */
const getStudentSessions = asyncHandler(async (req, res) => {
  const class_id = req.user.class_id;

  if (!class_id) {
    throw new ApiError(400, 'Token không chứa class_id hợp lệ.');
  }

  // Mục 9: Lấy toàn bộ session PUBLISHED của mọi lớp, join tên lớp
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, title, status, published_at, created_at, class_id, deadline, classes(name)')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn danh sách session: ${error.message}`);
  }

  // Đánh dấu session nào thuộc lớp học sinh
  const withOwnership = (sessions || []).map((s) => ({
    ...s,
    class_name: s.classes?.name,
    is_own_class: s.class_id === class_id,
  }));

  return res.status(200).json({
    success: true,
    data: { class_id, sessions: withOwnership },
  });
});

/**
 * GET /api/student/sessions/:session_id/attempts
 * Học sinh tự xem lịch sử làm bài của chính mình.
 * Mục 7: Không trả submitted_answers nếu chưa PASSED.
 */
const getMyAttempts = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const student_id = req.user.student_id;

  const { data: attempts, error } = await supabase
    .from('attempts')
    .select('id, attempt_number, status, score, correct_count, total_questions, duration_seconds, created_at, submitted_at')
    .eq('session_id', session_id)
    .eq('student_id', student_id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn lịch sử làm bài: ${error.message}`);
  }

  return res.status(200).json({
    success: true,
    data: attempts || [],
  });
});

/**
 * GET /api/student/sessions/:session_id/exercises
 *
 * Lấy nội dung bài tập của 1 session (học sinh chỉ xem được nếu session PUBLISHED và thuộc lớp mình).
 */
const getSessionExercises = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const class_id = req.user.class_id;

  // Kiểm tra session tồn tại, đã published và thuộc lớp học sinh
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, title, class_id, status')
    .eq('id', session_id)
    .maybeSingle();

  if (sessionError) {
    throw new ApiError(500, `Lỗi truy vấn session: ${sessionError.message}`);
  }
  if (!session) {
    throw new ApiError(404, 'Không tìm thấy session.');
  }
  if (session.status !== 'PUBLISHED') {
    throw new ApiError(403, 'Bài tập này chưa được giáo viên giao.');
  }
  if (session.class_id !== class_id) {
    throw new ApiError(403, 'Bài tập này không thuộc lớp của bạn.');
  }

  // Lấy exercises
  const { data: exercise, error: exerciseError } = await supabase
    .from('exercises')
    .select('content')
    .eq('session_id', session_id)
    .maybeSingle();

  if (exerciseError) {
    throw new ApiError(500, `Lỗi truy vấn bài tập: ${exerciseError.message}`);
  }
  if (!exercise) {
    throw new ApiError(404, 'Chưa có dữ liệu bài tập cho session này.');
  }

  return res.status(200).json({
    success: true,
    data: {
      session_id,
      session_title: session.title,
      exercises: exercise.content,
    },
  });
});

module.exports = { getStudentSessions, getSessionExercises, getMyAttempts };
