const supabase = require('../config/supabaseClient');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

/**
 * GET /api/teacher/dashboard/:class_id
 *
 * Trả về tổng quan cho giáo viên: danh sách session của lớp và thống kê
 * số học sinh đã PASSED / FAILED / IN_PROGRESS trên mỗi session.
 */
const getClassDashboard = asyncHandler(async (req, res) => {
  const { class_id } = req.params;

  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, title, status, created_at, published_at')
    .eq('class_id', class_id)
    .order('created_at', { ascending: false });

  if (sessionsError) {
    throw new ApiError(500, `Lỗi truy vấn danh sách session: ${sessionsError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'Lớp học chưa có session nào.',
      data: { class_id, sessions: [] },
    });
  }

  const sessionIds = sessions.map((s) => s.id);

  const { data: attempts, error: attemptsError } = await supabase
    .from('attempts')
    .select('session_id, student_id, status, score')
    .in('session_id', sessionIds);

  if (attemptsError) {
    throw new ApiError(500, `Lỗi truy vấn lượt làm bài: ${attemptsError.message}`);
  }

  const dashboard = sessions.map((session) => {
    const sessionAttempts = (attempts || []).filter((a) => a.session_id === session.id);
    const uniqueStudents = new Set(sessionAttempts.map((a) => a.student_id));

    const passedStudents = new Set(
      sessionAttempts.filter((a) => a.status === 'PASSED').map((a) => a.student_id)
    );
    const inProgressCount = sessionAttempts.filter((a) => a.status === 'IN_PROGRESS').length;

    const scores = sessionAttempts.filter((a) => a.score !== null).map((a) => a.score);
    const avgScore =
      scores.length > 0 ? Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2)) : null;

    return {
      session_id: session.id,
      title: session.title,
      status: session.status,
      created_at: session.created_at,
      published_at: session.published_at,
      total_students_attempted: uniqueStudents.size,
      total_students_passed: passedStudents.size,
      total_in_progress_attempts: inProgressCount,
      average_score: avgScore,
    };
  });

  return res.status(200).json({
    success: true,
    data: { class_id, sessions: dashboard },
  });
});

module.exports = { getClassDashboard };
