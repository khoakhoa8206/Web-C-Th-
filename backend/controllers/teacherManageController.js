const supabase = require('../config/supabaseClient');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

/**
 * GET /api/teacher/classes
 * Lấy danh sách tất cả lớp học.
 */
const getClasses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, teacher_name, created_at')
    .order('name', { ascending: true });

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn danh sách lớp: ${error.message}`);
  }

  return res.status(200).json({ success: true, data: data || [] });
});

/**
 * POST /api/teacher/classes
 * Body: { name, teacher_name? }
 * Tạo mới một khối/lớp học.
 */
const createClass = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ApiError(400, 'Vui lòng cung cấp tên khối lớp.');
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Lỗi khi tạo khối lớp: ${error.message}`);
  }

  return res.status(201).json({ success: true, data });
});

/**
 * GET /api/teacher/students?class_id=...
 * Lấy danh sách học sinh, tuỳ chọn lọc theo class_id.
 */
const getStudents = asyncHandler(async (req, res) => {
  const { class_id } = req.query;

  let query = supabase
    .from('students')
    .select('id, full_name, class_id, created_at');

  if (class_id) {
    query = query.eq('class_id', class_id);
  }

  const { data, error } = await query.order('full_name', { ascending: true });

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn danh sách học sinh: ${error.message}`);
  }

  return res.status(200).json({ success: true, data: data || [] });
});

/**
 * POST /api/teacher/students
 * Body: { full_name, class_id }
 */
const createStudent = asyncHandler(async (req, res) => {
  const { full_name, class_id } = req.body;

  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    throw new ApiError(400, 'Vui lòng cung cấp full_name hợp lệ.');
  }
  if (!class_id) {
    throw new ApiError(400, 'Vui lòng cung cấp class_id.');
  }

  const { data, error } = await supabase
    .from('students')
    .insert({ full_name: full_name.trim(), class_id })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Lỗi khi thêm học sinh: ${error.message}`);
  }

  return res.status(201).json({ success: true, data });
});

/**
 * PUT /api/teacher/students/:id
 * Body: { full_name?, class_id? }
 */
const updateStudentRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patch = {};

  if (req.body.full_name) patch.full_name = req.body.full_name.trim();
  if (req.body.class_id) patch.class_id = req.body.class_id;

  if (Object.keys(patch).length === 0) {
    throw new ApiError(400, 'Vui lòng cung cấp ít nhất một trường để cập nhật.');
  }

  const { data, error } = await supabase
    .from('students')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Lỗi khi cập nhật học sinh: ${error.message}`);
  }

  return res.status(200).json({ success: true, data });
});

/**
 * DELETE /api/teacher/students/:id
 */
const deleteStudentRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, `Lỗi khi xoá học sinh: ${error.message}`);
  }

  return res.status(200).json({ success: true, message: 'Đã xoá học sinh.' });
});

/**
 * GET /api/teacher/sessions?class_id=...
 * Lấy danh sách session theo lớp (dùng cho dropdown chọn session).
 */
const getSessions = asyncHandler(async (req, res) => {
  const { class_id } = req.query;

  if (!class_id) {
    throw new ApiError(400, 'Vui lòng cung cấp class_id.');
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('id, class_id, title, status, published_at, created_at, deadline')
    .eq('class_id', class_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn sessions: ${error.message}`);
  }

  return res.status(200).json({ success: true, data: data || [] });
});

/**
 * PUT /api/teacher/sessions/:id
 * Body: { title?, deadline? }
 */
const updateSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patch = {};
  const deadlineValue = req.body.deadline !== undefined ? (req.body.deadline || null) : undefined;

  if (req.body.title !== undefined) patch.title = req.body.title.trim();
  // deadline được tách ra để update riêng (tránh lỗi nếu cột chưa migrate)

  if (Object.keys(patch).length === 0 && deadlineValue === undefined) {
    throw new ApiError(400, 'Vui lòng cung cấp ít nhất một trường để cập nhật (title hoặc deadline).');
  }

  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    throw new ApiError(404, 'Không tìm thấy session.');
  }

  // Bước 1: update các field an toàn (title, updated_at)
  let data = existing;
  if (Object.keys(patch).length > 0) {
    patch.updated_at = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from('sessions')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, `Lỗi khi cập nhật session: ${error.message}`);
    }
    data = updated;
  }

  // Bước 2: update deadline riêng — bỏ qua nếu cột chưa tồn tại
  if (deadlineValue !== undefined) {
    const { error: deadlineError } = await supabase
      .from('sessions')
      .update({ deadline: deadlineValue })
      .eq('id', id);

    if (!deadlineError) {
      data = { ...data, deadline: deadlineValue };
    } else {
      console.warn('[updateSession] Không thể set deadline (cột chưa tồn tại?):', deadlineError.message);
    }
  }

  return res.status(200).json({ success: true, data });
});

/**
 * DELETE /api/teacher/sessions/:id
 */
const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, `Lỗi khi xoá session: ${error.message}`);
  }

  return res.status(200).json({ success: true, message: 'Đã xoá session.' });
});

/**
 * GET /api/teacher/attempts?session_id=...
 * Lấy attempts của 1 session (dùng cho dashboard và export CSV).
 */
const getAttempts = asyncHandler(async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    throw new ApiError(400, 'Vui lòng cung cấp session_id.');
  }

  const { data, error } = await supabase
    .from('attempts')
    .select('id, student_id, session_id, attempt_number, score, correct_count, total_questions, duration_seconds, status, submitted_at, created_at')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new ApiError(500, `Lỗi truy vấn attempts: ${error.message}`);
  }

  return res.status(200).json({ success: true, data: data || [] });
});

/**
 * DELETE /api/teacher/classes/:id
 * Xoá khối lớp — cascade xoá học sinh, bài tập và lịch sử làm bài (mục 7).
 */
const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: existing, error: fetchError } = await supabase
    .from('classes')
    .select('id, name')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    throw new ApiError(500, `Lỗi truy vấn khối lớp: ${fetchError.message}`);
  }
  if (!existing) {
    throw new ApiError(404, 'Không tìm thấy khối lớp.');
  }

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) throw new ApiError(500, `Lỗi khi xoá khối lớp: ${error.message}`);

  return res.json({ success: true, message: `Đã xoá khối lớp "${existing.name}".` });
});

module.exports = {
  getClasses,
  createClass,
  getStudents,
  createStudent,
  updateStudentRecord,
  deleteStudentRecord,
  getSessions,
  updateSession,
  deleteSession,
  getAttempts,
  deleteClass,
};
