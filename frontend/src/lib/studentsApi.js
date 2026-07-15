import { teacherFetch } from './apiClient';

/**
 * Students API — gọi backend Express thay vì Supabase trực tiếp.
 */

export async function fetchStudents(classId) {
  const url = classId
    ? `/api/teacher/students?class_id=${classId}`
    : '/api/teacher/students';
  const json = await teacherFetch(url);
  return json.data || [];
}

export async function createStudent({ full_name, class_id }) {
  const json = await teacherFetch('/api/teacher/students', {
    method: 'POST',
    body: JSON.stringify({ full_name, class_id }),
  });
  return json.data;
}

export async function updateStudent(id, patch) {
  const json = await teacherFetch(`/api/teacher/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return json.data;
}

export async function deleteStudent(id) {
  await teacherFetch(`/api/teacher/students/${id}`, { method: 'DELETE' });
}
