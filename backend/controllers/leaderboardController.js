const supabase = require('../config/supabaseClient');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

/**
 * GET /api/leaderboard/classes — danh sách lớp (để chọn khối)
 */
const getClasses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .order('name');

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn danh sách khối lớp: ${error.message}`);
  }

  res.json({ success: true, data: data || [] });
});

/**
 * GET /api/leaderboard/sessions?class_id=xxx — sessions PUBLISHED của 1 lớp
 */
const getSessions = asyncHandler(async (req, res) => {
  const { class_id } = req.query;
  const query = supabase
    .from('sessions')
    .select('id, title, class_id, published_at')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false });

  if (class_id) query.eq('class_id', class_id);

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn danh sách buổi học: ${error.message}`);
  }

  res.json({ success: true, data: data || [] });
});

/**
 * GET /api/leaderboard?session_id=xxx — bảng xếp hạng của 1 buổi học
 * Chỉ tính lần PASSED, lấy kết quả tốt nhất của mỗi học sinh
 * (điểm cao nhất; nếu bằng thì thời gian nhanh hơn).
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) throw new ApiError(400, 'Cần session_id.');

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, title, class_id, classes(name)')
    .eq('id', session_id)
    .maybeSingle();

  if (sessionError) {
    throw new ApiError(500, `Lỗi truy vấn session: ${sessionError.message}`);
  }
  if (!session) throw new ApiError(404, 'Không tìm thấy session.');

  // Tất cả PASSED attempts, join students
  const { data: passedAttempts, error: passedError } = await supabase
    .from('attempts')
    .select('student_id, score, duration_seconds, students(full_name)')
    .eq('session_id', session_id)
    .eq('status', 'PASSED');

  if (passedError) {
    throw new ApiError(500, `Lỗi truy vấn kết quả PASSED: ${passedError.message}`);
  }

  // Tổng số lần làm (cả passed + failed) per student
  const { data: allAttempts, error: allError } = await supabase
    .from('attempts')
    .select('student_id')
    .eq('session_id', session_id);

  if (allError) {
    throw new ApiError(500, `Lỗi truy vấn tổng số lần làm bài: ${allError.message}`);
  }

  const attemptCountMap = {};
  (allAttempts || []).forEach((a) => {
    attemptCountMap[a.student_id] = (attemptCountMap[a.student_id] || 0) + 1;
  });

  // Dedup: mỗi học sinh chỉ lấy best PASSED (điểm cao nhất, thời gian nhanh nhất)
  const bestMap = {};
  (passedAttempts || []).forEach((a) => {
    const prev = bestMap[a.student_id];
    if (!prev || a.score > prev.score || (a.score === prev.score && a.duration_seconds < prev.duration_seconds)) {
      bestMap[a.student_id] = a;
    }
  });

  const ranked = Object.entries(bestMap)
    .map(([studentId, a]) => ({
      student_id: studentId,
      full_name: a.students?.full_name || 'Ẩn danh',
      best_score: a.score,
      best_duration: a.duration_seconds,
      total_attempts: attemptCountMap[studentId] || 1,
    }))
    .sort((a, b) => b.best_score - a.best_score || a.best_duration - b.best_duration)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));

  res.json({
    success: true,
    data: {
      session_title: session.title,
      class_name: session.classes?.name || '',
      ranked,
    },
  });
});

module.exports = { getClasses, getSessions, getLeaderboard };
