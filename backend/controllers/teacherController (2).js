const supabase = require('../config/supabaseClient');
const { generateExercisesFromVocabulary } = require('../config/geminiClient');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

/**
 * POST /api/teacher/generate-exercises
 * Body: { class_id: "uuid", vocabulary_list: "apple, banana, diligent..." }
 *
 * 1. Gọi Gemini sinh cấu trúc 4 bài tập.
 * 2. Tạo bản ghi nháp trong `sessions` (status = DRAFT).
 * 3. Tạo bản ghi tương ứng trong `exercises` chứa JSON bài tập.
 * 4. Trả về dữ liệu bài tập + session_id để giáo viên xem trước.
 */
const generateExercises = asyncHandler(async (req, res) => {
  const { class_id, vocabulary_list } = req.body;

  if (!class_id || typeof class_id !== 'string') {
    throw new ApiError(400, 'Vui lòng cung cấp class_id hợp lệ.');
  }
  if (!vocabulary_list || typeof vocabulary_list !== 'string' || !vocabulary_list.trim()) {
    throw new ApiError(400, 'Vui lòng cung cấp danh sách từ vựng (vocabulary_list) hợp lệ.');
  }

  // Kiểm tra lớp tồn tại trước khi tốn chi phí gọi AI
  const { data: klass, error: classError } = await supabase
    .from('classes')
    .select('id, name')
    .eq('id', class_id)
    .maybeSingle();

  if (classError) {
    throw new ApiError(500, `Lỗi truy vấn lớp học: ${classError.message}`);
  }
  if (!klass) {
    throw new ApiError(404, 'Không tìm thấy lớp học với class_id này.');
  }

  // 1. Gọi Gemini sinh bài tập
  let generated;
  try {
    generated = await generateExercisesFromVocabulary(vocabulary_list.trim());
  } catch (err) {
    throw new ApiError(502, `Lỗi khi gọi Gemini AI để sinh bài tập: ${err.message}`);
  }

  const sessionTitle = generated.session_title || `Bài tập từ vựng - ${new Date().toLocaleDateString('vi-VN')}`;

  // 2. Tạo session nháp
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      class_id,
      title: sessionTitle,
      status: 'DRAFT',
      vocabulary_source: vocabulary_list.trim(),
    })
    .select()
    .single();

  if (sessionError) {
    throw new ApiError(500, `Lỗi khi tạo session nháp: ${sessionError.message}`);
  }

  // 3. Tạo bản ghi exercises tương ứng
  const exerciseContent = {
    flashcards: generated.flashcards || [],
    match_up: generated.match_up || [],
    fill_in_blanks: generated.fill_in_blanks || [],
    mcqs: generated.mcqs || [],
  };

  const { data: exercise, error: exerciseError } = await supabase
    .from('exercises')
    .insert({
      session_id: session.id,
      content: exerciseContent,
    })
    .select()
    .single();

  if (exerciseError) {
    // Rollback thủ công: xoá session vừa tạo nếu lưu exercises thất bại
    await supabase.from('sessions').delete().eq('id', session.id);
    throw new ApiError(500, `Lỗi khi lưu bài tập: ${exerciseError.message}`);
  }

  return res.status(201).json({
    success: true,
    message: 'Sinh bài tập bằng AI thành công. Vui lòng xem trước và chỉnh sửa nếu cần.',
    data: {
      session_id: session.id,
      session_title: session.title,
      status: session.status,
      exercises: exercise.content,
    },
  });
});

/**
 * PUT /api/teacher/update-exercises/:session_id
 * Body: { session_title, flashcards, match_up, fill_in_blanks, mcqs }
 *
 * Cho phép giáo viên chỉnh sửa trực tiếp nội dung bài tập, kể cả khi session
 * đã PUBLISHED (đã giao cho học sinh) — ví dụ sửa từ sai, thêm từ mới, sửa câu hỏi...
 *
 * Lưu ý an toàn dữ liệu học sinh:
 * - Học sinh ĐÃ NỘP BÀI (attempt không còn IN_PROGRESS): điểm số được chấm và
 *   lưu cố định tại thời điểm nộp bài (xem submitAttempt/scoring.js), nên sửa
 *   exercises sau đó KHÔNG ảnh hưởng ngược tới điểm đã có.
 * - Học sinh ĐANG LÀM DỞ (attempt IN_PROGRESS): lần nộp bài tiếp theo của họ sẽ
 *   được chấm theo nội dung MỚI nhất (gradeAttempt duyệt theo exercises.content
 *   hiện tại, không dùng ID nào không còn tồn tại nên không bị crash — xem
 *   utils/scoring.js), nhưng có thể lệch với câu họ đã thấy lúc làm bài.
 *   Giáo viên nên hạn chế sửa bài khi có học sinh đang làm dở.
 */
const updateExercises = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const { session_title, flashcards, match_up, fill_in_blanks, mcqs } = req.body;

  const { data: session, error: sessionFetchError } = await supabase
    .from('sessions')
    .select('id, status')
    .eq('id', session_id)
    .maybeSingle();

  if (sessionFetchError) {
    console.error('[updateExercises] Lỗi truy vấn session:', session_id, sessionFetchError);
    throw new ApiError(500, `Lỗi truy vấn session: ${sessionFetchError.message}`);
  }
  if (!session) {
    throw new ApiError(404, 'Không tìm thấy session với session_id này.');
  }

  // Cập nhật tiêu đề session (nếu có gửi lên)
  if (session_title) {
    const { error: titleUpdateError } = await supabase
      .from('sessions')
      .update({ title: session_title, updated_at: new Date().toISOString() })
      .eq('id', session_id);

    if (titleUpdateError) {
      console.error('[updateExercises] Lỗi cập nhật tiêu đề session:', session_id, titleUpdateError);
      throw new ApiError(500, `Lỗi khi cập nhật tiêu đề session: ${titleUpdateError.message}`);
    }
  }

  const updatedContent = {
    flashcards: flashcards || [],
    match_up: match_up || [],
    fill_in_blanks: fill_in_blanks || [],
    mcqs: mcqs || [],
  };

  const { data: updatedExercise, error: exerciseUpdateError } = await supabase
    .from('exercises')
    .update({ content: updatedContent, updated_at: new Date().toISOString() })
    .eq('session_id', session_id)
    .select()
    .single();

  if (exerciseUpdateError) {
    console.error('[updateExercises] Lỗi cập nhật exercises:', session_id, exerciseUpdateError);
    throw new ApiError(500, `Lỗi khi cập nhật bài tập: ${exerciseUpdateError.message}`);
  }

  return res.status(200).json({
    success: true,
    message:
      session.status === 'PUBLISHED'
        ? 'Cập nhật bài tập thành công. Bài đã giao cho học sinh — thay đổi sẽ áp dụng cho học sinh chưa nộp bài.'
        : 'Cập nhật bài tập thành công.',
    data: {
      session_id,
      session_title: session_title || undefined,
      session_status: session.status,
      exercises: updatedExercise.content,
    },
  });
});

/**
 * PUT /api/teacher/publish-session/:session_id
 * Chuyển status session sang PUBLISHED để chính thức giao bài cho học sinh.
 */
const publishSession = asyncHandler(async (req, res) => {
  const { session_id } = req.params;

  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('id, status')
    .eq('id', session_id)
    .maybeSingle();

  if (fetchError) {
    console.error('[publishSession] Lỗi truy vấn session:', session_id, fetchError);
    throw new ApiError(500, `Lỗi truy vấn session: ${fetchError.message}`);
  }
  if (!session) {
    throw new ApiError(404, 'Không tìm thấy session với session_id này.');
  }
  if (session.status === 'PUBLISHED') {
    return res.status(200).json({
      success: true,
      message: 'Session này đã ở trạng thái PUBLISHED từ trước.',
      data: { session_id, status: 'PUBLISHED' },
    });
  }

  const { deadline } = req.body || {};

  // Bước 1: publish (chỉ status + published_at, không kèm deadline tránh lỗi cột chưa migrate)
  const updatePayload = { status: 'PUBLISHED', published_at: new Date().toISOString() };

  const { data: updated, error: updateError } = await supabase
    .from('sessions')
    .update(updatePayload)
    .eq('id', session_id)
    .select()
    .single();

  if (updateError) {
    console.error('[publishSession] Lỗi khi giao bài:', session_id, updateError);
    throw new ApiError(500, `Lỗi khi giao bài (publish session): ${updateError.message}`);
  }

  // Bước 2: nếu có deadline, thử set riêng — nếu cột chưa migrate thì bỏ qua, không fail toàn request
  let deadlineSet = null;
  if (deadline) {
    const { error: deadlineError } = await supabase
      .from('sessions')
      .update({ deadline })
      .eq('id', session_id);

    if (!deadlineError) {
      deadlineSet = deadline;
    } else {
      console.warn('[publishSession] Không thể set deadline (cột chưa tồn tại?):', deadlineError.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Đã giao bài tập cho học sinh thành công.',
    data: {
      session_id: updated.id,
      status: updated.status,
      published_at: updated.published_at,
      deadline: deadlineSet,
    },
  });
});

/**
 * PUT /api/teacher/schedule-session/:session_id
 * Body: { scheduled_publish_at, deadline? }
 *
 * Hẹn giờ tự động giao bài (mục 5): chuyển session sang status = 'SCHEDULED',
 * lưu `scheduled_publish_at`. Cron job + lazy-check (xem utils/scheduledPublish.js)
 * sẽ tự động chuyển sang PUBLISHED đúng lúc tới giờ.
 */
const scheduleSession = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const { scheduled_publish_at, deadline } = req.body || {};

  if (!scheduled_publish_at) {
    throw new ApiError(400, 'Vui lòng cung cấp scheduled_publish_at (thời điểm sẽ tự động giao bài).');
  }
  const scheduledDate = new Date(scheduled_publish_at);
  if (Number.isNaN(scheduledDate.getTime())) {
    throw new ApiError(400, 'scheduled_publish_at không hợp lệ.');
  }
  if (scheduledDate.getTime() <= Date.now()) {
    throw new ApiError(400, 'Thời điểm hẹn giờ phải ở tương lai. Nếu muốn giao ngay, dùng chức năng "Giao ngay".');
  }

  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('id, status')
    .eq('id', session_id)
    .maybeSingle();

  if (fetchError) {
    console.error('[scheduleSession] Lỗi truy vấn session:', session_id, fetchError);
    throw new ApiError(500, `Lỗi truy vấn session: ${fetchError.message}`);
  }
  if (!session) {
    throw new ApiError(404, 'Không tìm thấy session với session_id này.');
  }
  if (session.status === 'PUBLISHED') {
    throw new ApiError(409, 'Session đã được giao (PUBLISHED) từ trước, không thể hẹn giờ lại.');
  }

  const updatePayload = {
    status: 'SCHEDULED',
    scheduled_publish_at: scheduledDate.toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from('sessions')
    .update(updatePayload)
    .eq('id', session_id)
    .select()
    .single();

  if (updateError) {
    console.error('[scheduleSession] Lỗi khi hẹn giờ giao bài:', session_id, updateError);
    throw new ApiError(500, `Lỗi khi hẹn giờ giao bài: ${updateError.message}`);
  }

  if (deadline) {
    const { error: deadlineError } = await supabase.from('sessions').update({ deadline }).eq('id', session_id);
    if (deadlineError) {
      console.warn('[scheduleSession] Không thể set deadline:', deadlineError.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: `Đã hẹn giờ giao bài lúc ${scheduledDate.toLocaleString('vi-VN')}.`,
    data: {
      session_id: updated.id,
      status: updated.status,
      scheduled_publish_at: updated.scheduled_publish_at,
    },
  });
});

/**
 * PUT /api/teacher/cancel-schedule/:session_id
 * Huỷ lịch hẹn giờ giao bài, đưa session về lại DRAFT.
 */
const cancelSchedule = asyncHandler(async (req, res) => {
  const { session_id } = req.params;

  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('id, status')
    .eq('id', session_id)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, `Lỗi truy vấn session: ${fetchError.message}`);
  }
  if (!session) {
    throw new ApiError(404, 'Không tìm thấy session với session_id này.');
  }
  if (session.status !== 'SCHEDULED') {
    throw new ApiError(409, 'Session này hiện không ở trạng thái hẹn giờ (SCHEDULED).');
  }

  const { data: updated, error: updateError } = await supabase
    .from('sessions')
    .update({ status: 'DRAFT', scheduled_publish_at: null, updated_at: new Date().toISOString() })
    .eq('id', session_id)
    .select()
    .single();

  if (updateError) {
    throw new ApiError(500, `Lỗi khi huỷ lịch hẹn giờ: ${updateError.message}`);
  }

  return res.status(200).json({
    success: true,
    message: 'Đã huỷ lịch hẹn giờ giao bài, session trở về trạng thái nháp (DRAFT).',
    data: { session_id: updated.id, status: updated.status },
  });
});

module.exports = { generateExercises, updateExercises, publishSession, scheduleSession, cancelSchedule };
