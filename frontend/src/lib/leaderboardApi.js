const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * leaderboardApi.js — bảng xếp hạng là dữ liệu PUBLIC, không cần đăng nhập
 * nên không dùng apiClient (vốn tự gắn Authorization header).
 */
async function publicFetch(url) {
  const res = await fetch(`${BASE_URL}${url}`);
  const json = await res.json().catch(() => ({ success: false, message: 'Lỗi phân tích phản hồi từ server.' }));
  if (!json.success) throw new Error(json.message || 'Lỗi tải dữ liệu');
  return json.data;
}

export const fetchLeaderboardClasses = () => publicFetch('/api/leaderboard/classes');

export const fetchLeaderboardSessions = (classId) =>
  publicFetch(`/api/leaderboard/sessions${classId ? `?class_id=${classId}` : ''}`);

export const fetchLeaderboard = (sessionId) =>
  publicFetch(`/api/leaderboard?session_id=${sessionId}`);
