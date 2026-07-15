/**
 * apiClient.js — helper fetch dùng chung cho mọi lời gọi tới Express backend.
 *
 * - Tự thêm header Authorization: Bearer <token>
 * - Ưu tiên student token, nếu không có thì dùng teacher token
 * - Ném Error với message từ server nếu response không OK
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const STUDENT_TOKEN_KEY = 'stu_token';
const TEACHER_TOKEN_KEY = 'teacher_token';

export function getActiveToken() {
  return (
    localStorage.getItem(STUDENT_TOKEN_KEY) ||
    localStorage.getItem(TEACHER_TOKEN_KEY) ||
    null
  );
}

export function getTeacherToken() {
  return localStorage.getItem(TEACHER_TOKEN_KEY);
}

/**
 * Gọi API backend.
 * @param {string} path - ví dụ: '/api/auth/login'
 * @param {RequestInit} options - fetch options (method, body, v.v.)
 * @returns {Promise<any>} - data từ server (field `data` của response JSON)
 */
export async function apiFetch(path, options = {}) {
  const token = getActiveToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({ success: false, message: 'Lỗi phân tích phản hồi từ server.' }));

  if (!res.ok) {
    throw new Error(json.message || `Lỗi ${res.status} từ server.`);
  }

  return json;
}

/**
 * Gọi API với student token (dùng khi cần tường minh là student request).
 */
export async function studentFetch(path, options = {}) {
  const token = localStorage.getItem(STUDENT_TOKEN_KEY);
  return apiFetch(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

/**
 * Gọi API với teacher token.
 */
export async function teacherFetch(path, options = {}) {
  const token = localStorage.getItem(TEACHER_TOKEN_KEY);
  return apiFetch(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
