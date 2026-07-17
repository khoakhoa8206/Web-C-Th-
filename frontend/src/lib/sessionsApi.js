import { teacherFetch } from './apiClient';

/**
 * Sessions API — gọi backend Express thay vì Supabase trực tiếp.
 */

/** Lấy danh sách lớp học từ backend. */
export async function fetchClasses() {
  const json = await teacherFetch('/api/teacher/classes');
  return json.data || [];
}

/** Tạo mới một khối lớp. */
export async function createClass({ name }) {
  const json = await teacherFetch('/api/teacher/classes', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return json.data;
}

/** Xoá khối lớp (cascade xoá học sinh, bài tập, lịch sử làm bài). */
export async function deleteClass(id) {
  const json = await teacherFetch(`/api/teacher/classes/${id}`, { method: 'DELETE' });
  return json;
}

/** Lấy danh sách session theo lớp. */
export async function fetchSessionsForClass(classId) {
  if (!classId) return [];
  const json = await teacherFetch(`/api/teacher/sessions?class_id=${classId}`);
  return (json.data || []).map((s) => ({
    id: s.id,
    class_id: s.class_id,
    title: s.title,
    status: s.status,
    published_at: s.published_at,
    deadline: s.deadline || null,
    scheduled_publish_at: s.scheduled_publish_at || null,
  }));
}

/** Sửa tên / deadline của session. */
export async function updateSession(id, patch) {
  const json = await teacherFetch(`/api/teacher/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return json.data;
}

/** Giao bài (publish) một session đang DRAFT, có thể kèm deadline tuỳ chọn. */
export async function publishExistingSession(id, deadline) {
  const json = await teacherFetch(`/api/teacher/publish-session/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deadline ? { deadline } : {}),
  });
  return json.data;
}

/** Hẹn giờ tự động giao bài vào 1 thời điểm trong tương lai. */
export async function scheduleSessionPublish(id, scheduledPublishAt, deadline) {
  const json = await teacherFetch(`/api/teacher/schedule-session/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      scheduled_publish_at: scheduledPublishAt,
      ...(deadline ? { deadline } : {}),
    }),
  });
  return json.data;
}

/** Huỷ lịch hẹn giờ giao bài, đưa session về lại DRAFT. */
export async function cancelScheduledPublish(id) {
  const json = await teacherFetch(`/api/teacher/cancel-schedule/${id}`, {
    method: 'PUT',
  });
  return json.data;
}

/** Lấy nội dung bài tập (4 loại) của 1 session để sửa (kể cả session đã PUBLISHED). */
export async function fetchSessionExercises(id) {
  const json = await teacherFetch(`/api/teacher/sessions/${id}/exercises`);
  const data = json.data;
  return {
    session_id: data.session_id,
    session_title: data.session_title,
    status: data.status,
    deadline: data.deadline,
    flashcards: data.exercises?.flashcards || [],
    matchup: data.exercises?.match_up || [],
    fillblanks: data.exercises?.fill_in_blanks || [],
    mcq: data.exercises?.mcqs || [],
  };
}

/** Lưu lại nội dung bài tập đã sửa (kể cả khi session đã PUBLISHED). */
export async function updateSessionExercises(sessionId, lessonData) {
  const json = await teacherFetch(`/api/teacher/update-exercises/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      flashcards: lessonData.flashcards || [],
      match_up: lessonData.matchup || [],
      fill_in_blanks: lessonData.fillblanks || [],
      mcqs: lessonData.mcq || [],
    }),
  });
  return json;
}

/** Xoá session (cascade xoá exercises + attempts). */
export async function deleteSession(id) {
  const json = await teacherFetch(`/api/teacher/sessions/${id}`, {
    method: 'DELETE',
  });
  return json;
}
