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

/** Xoá session (cascade xoá exercises + attempts). */
export async function deleteSession(id) {
  const json = await teacherFetch(`/api/teacher/sessions/${id}`, {
    method: 'DELETE',
  });
  return json;
}
