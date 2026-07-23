import { apiFetch } from './apiClient';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * leaderboardApi.js — bảng xếp hạng nội bộ, cần đăng nhập.
 * Dùng apiFetch để tự gắn Authorization header từ JWT.
 */
async function publicFetch(url) {
  const res = await fetch(`${BASE_URL}${url}`);
  const json = await res.json().catch(() => ({ success: false, message: 'Lỗi phân tích phản hồi từ server.' }));
  if (!json.success) throw new Error(json.message || 'Lỗi tải dữ liệu');
  return json.data;
}

export const fetchLeaderboardSessions = async (classId) => {
  try {
    // Thử dùng authenticated API trước
    const json = await apiFetch(`/api/leaderboard/sessions${classId ? `?class_id=${classId}` : ''}`);
    return json.data || json;
  } catch {
    // Fallback public
    return publicFetch(`/api/leaderboard/sessions${classId ? `?class_id=${classId}` : ''}`);
  }
};

export const fetchLeaderboard = async (sessionId) => {
  try {
    const json = await apiFetch(`/api/leaderboard?session_id=${sessionId}`);
    return json.data || json;
  } catch {
    return publicFetch(`/api/leaderboard?session_id=${sessionId}`);
  }
};
