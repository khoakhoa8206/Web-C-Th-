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
export async function createClass({ name, teacher_name }) {
  const json = await teacherFetch('/api/teacher/classes', {
    method: 'POST',
    body: JSON.stringify({ name, teacher_name }),
  });
  return json.data;
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
  }));
}
