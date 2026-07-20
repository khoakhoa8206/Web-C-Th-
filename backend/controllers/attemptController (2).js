const supabase = require('../config/supabaseClient');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');
const { gradeAttempt, formatResultForClient } = require('../utils/scoring');

const PASS_THRESHOLD_PERCENT = Number(process.env.PASS_THRESHOLD_PERCENT || 80);
const TOTAL_STEPS = 4; // 1: flashcards, 2: match_up, 3: fill_in_blanks, 4: mcqs (quy ước thứ tự làm bài)

/**
 * POST /api/attempts/start
 * Body: { session_id: "uuid" }
 *
 * Tạo 1 bản ghi attempts mới với current_step = 1, attempt_number tự tăng theo học sinh + session.
 */
const startAttempt = asyncHandler(async (req, res) => {
  const { session_id } = req.body;
  const student_id = req.user.student_id; // lấy từ JWT đã xác thực

  if (!session_id) {
    throw new ApiError(400, 'Vui lòng cung cấp session_id.');
  }

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, status, class_id, deadline')
    .eq('id', session_id)
    .maybeSingle();

  if (sessionError) {
    throw new ApiError(500, `Lỗi truy vấn session: ${sessionError.message}`);
  }
  if (!session) {
    throw new ApiError(404, 'Không tìm thấy session.');
  }
  if (session.status !== 'PUBLISHED') {
    throw new ApiError(403, 'Bài tập này chưa được giáo viên giao (chưa PUBLISHED).');
  }
  if (session.class_id !== req.user.class_id) {
    throw new ApiError(403, 'Bạn không thuộc lớp học được giao bài tập này.');
  }
  if (session.deadline && new Date(session.deadline) < new Date()) {
    throw new ApiError(403, 'Bài tập đã hết hạn nộp, không thể bắt đầu làm bài.');
  }

  // Đếm số lượt đã làm trước đó để xác định attempt_number kế tiếp
  const { count, error: countError } = await supabase
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session_id)
    .eq('student_id', student_id);

  if (countError) {
    throw new ApiError(500, `Lỗi khi đếm số lượt làm bài trước đó: ${countError.message}`);
  }

  const attemptNumber = (count || 0) + 1;

  const { data: attempt, error: insertError } = await supabase
    .from('attempts')
    .insert({
      session_id,
      student_id,
      attempt_number: attemptNumber,
      current_step: 1,
      status: 'IN_PROGRESS',
    })
    .select()
    .single();

  if (insertError) {
    throw new ApiError(500, `Lỗi khi tạo lượt làm bài: ${insertError.message}`);
  }

  return res.status(201).json({
    success: true,
    message: 'Bắt đầu làm bài thành công.',
    data: {
      attempt_id: attempt.id,
      attempt_number: attempt.attempt_number,
      current_step: attempt.current_step,
    },
  });
});

/**
 * PUT /api/attempts/update-step
 * Body: { attempt_id: "uuid", step: 2 | 3 | 4 }
 *
 * Anti-cheat: chỉ cho phép tăng step lên N nếu current_step hiện tại là N-1.
 * (Không cho nhảy cóc bước, không cho tự ý lùi step qua endpoint này.)
 */
const updateStep = asyncHandler(async (req, res) => {
  const { attempt_id, step } = req.body;
  const student_id = req.user.student_id;

  if (!attempt_id) {
    throw new ApiError(400, 'Vui lòng cung cấp attempt_id.');
  }
  if (![2, 3, 4].includes(step)) {
    throw new ApiError(400, 'Giá trị step không hợp lệ. Chỉ chấp nhận 2, 3 hoặc 4.');
  }

  const { data: attempt, error: fetchError } = await supabase
    .from('attempts')
    .select('id, student_id, current_step, status')
    .eq('id', attempt_id)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, `Lỗi truy vấn lượt làm bài: ${fetchError.message}`);
  }
  if (!attempt) {
    throw new ApiError(404, 'Không tìm thấy lượt làm bài (attempt) này.');
  }
  if (attempt.student_id !== student_id) {
    throw new ApiError(403, 'Bạn không có quyền cập nhật lượt làm bài này.');
  }
  if (attempt.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'Lượt làm bài này đã kết thúc, không thể cập nhật tiến trình.');
  }

  // === CHỐNG GIAN LẬN: chỉ được tăng step lên N nếu current_step hiện tại đúng là N-1 ===
  if (attempt.current_step !== step - 1) {
    throw new ApiError(
      409,
      `Không hợp lệ: bạn đang ở bước ${attempt.current_step}, không thể nhảy tới bước ${step}. ` +
      `Chỉ được chuyển sang bước ${attempt.current_step + 1}.`
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from('attempts')
    .update({ current_step: step, updated_at: new Date().toISOString() })
    .eq('id', attempt_id)
    .select()
    .single();

  if (updateError) {
    throw new ApiError(500, `Lỗi khi cập nhật bước làm bài: ${updateError.message}`);
  }

  return res.status(200).json({
    success: true,
    message: `Đã chuyển sang bước ${updated.current_step}.`,
    data: { attempt_id: updated.id, current_step: updated.current_step },
  });
});

/**
 * POST /api/attempts/submit
 * Body: { attempt_id: "uuid", answers: { match_up, fill_in_blanks, mcqs }, duration_seconds: 120 }
 *
 * - Chỉ chấp nhận khi current_step hiện tại === 4 (đã hoàn thành hết các bước trước).
 * - Tính % chính xác.
 * - >= ngưỡng PASS: đánh dấu PASSED, trả về toàn bộ đáp án (đúng + sai, kèm đáp án đúng).
 * - < ngưỡng PASS: đánh dấu FAILED, chỉ trả về câu sai, KHÔNG trả đáp án đúng.
 */
const submitAttempt = asyncHandler(async (req, res) => {
  const { attempt_id, answers, duration_seconds } = req.body;
  const student_id = req.user.student_id;

  if (!attempt_id) {
    throw new ApiError(400, 'Vui lòng cung cấp attempt_id.');
  }
  if (!answers || typeof answers !== 'object') {
    throw new ApiError(400, 'Vui lòng cung cấp answers hợp lệ.');
  }
  if (typeof duration_seconds !== 'number' || duration_seconds < 0) {
    throw new ApiError(400, 'duration_seconds phải là số không âm.');
  }

  const { data: attempt, error: fetchError } = await supabase
    .from('attempts')
    .select('id, student_id, session_id, current_step, status')
    .eq('id', attempt_id)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, `Lỗi truy vấn lượt làm bài: ${fetchError.message}`);
  }
  if (!attempt) {
    throw new ApiError(404, 'Không tìm thấy lượt làm bài (attempt) này.');
  }
  if (attempt.student_id !== student_id) {
    throw new ApiError(403, 'Bạn không có quyền nộp bài cho lượt làm bài này.');
  }
  if (attempt.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'Lượt làm bài này đã được nộp trước đó.');
  }

  // === Chỉ chấp nhận submit khi current_step === 4 ===
  if (attempt.current_step !== TOTAL_STEPS) {
    throw new ApiError(
      409,
      `Bạn chưa hoàn thành đủ các bước làm bài (đang ở bước ${attempt.current_step}/${TOTAL_STEPS}). ` +
      'Không thể nộp bài.'
    );
  }

  // Lấy đáp án đúng từ bảng exercises
  const { data: exercise, error: exerciseError } = await supabase
    .from('exercises')
    .select('content')
    .eq('session_id', attempt.session_id)
    .maybeSingle();

  if (exerciseError) {
    throw new ApiError(500, `Lỗi truy vấn bài tập: ${exerciseError.message}`);
  }
  if (!exercise) {
    throw new ApiError(404, 'Không tìm thấy dữ liệu bài tập tương ứng để chấm điểm.');
  }

  const { accuracy, totalGraded, correctCount, details } = gradeAttempt(exercise.content, answers);

  const passed = accuracy >= PASS_THRESHOLD_PERCENT;
  const finalStatus = passed ? 'PASSED' : 'FAILED';
  const clientResult = formatResultForClient(details, passed);

  const { data: updatedAttempt, error: updateError } = await supabase
    .from('attempts')
    .update({
      status: finalStatus,
      score: accuracy,
      correct_count: correctCount,
      total_questions: totalGraded,
      duration_seconds,
      submitted_answers: answers,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', attempt_id)
    .select()
    .single();

  if (updateError) {
    throw new ApiError(500, `Lỗi khi lưu kết quả bài làm: ${updateError.message}`);
  }

  return res.status(200).json({
    success: true,
    message:
      finalStatus === 'PASSED'
        ? `Chúc mừng! Bạn đã ĐẠT với độ chính xác ${accuracy}%.`
        : `Rất tiếc, bạn CHƯA ĐẠT (${accuracy}%, yêu cầu tối thiểu ${PASS_THRESHOLD_PERCENT}%). Hãy xem lại các câu sai bên dưới.`,
    data: {
      attempt_id: updatedAttempt.id,
      status: finalStatus,
      accuracy,
      correct_count: correctCount,
      total_questions: totalGraded,
      results: clientResult,
    },
  });
});

module.exports = { startAttempt, updateStep, submitAttempt };
