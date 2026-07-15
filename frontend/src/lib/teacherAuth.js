/**
 * teacherAuth.js — quản lý token giáo viên trong LocalStorage.
 *
 * Tách riêng khỏi auth.js (dành cho học sinh) để tránh nhầm lẫn.
 */
import { decodeJwt, isTokenExpired } from '../utils/jwt';
import { apiFetch } from './apiClient';

const TEACHER_TOKEN_KEY = 'teacher_token';

export function saveTeacherToken(token) {
  localStorage.setItem(TEACHER_TOKEN_KEY, token);
}

export function getTeacherToken() {
  return localStorage.getItem(TEACHER_TOKEN_KEY);
}

export function clearTeacherToken() {
  localStorage.removeItem(TEACHER_TOKEN_KEY);
}

/** Trả về payload nếu token teacher còn hợp lệ, ngược lại null. */
export function getCurrentTeacher() {
  const token = getTeacherToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || isTokenExpired(payload)) {
    clearTeacherToken();
    return null;
  }
  return payload;
}

export function isTeacherAuthenticated() {
  return !!getCurrentTeacher();
}

/** Đăng nhập giáo viên qua backend và lưu JWT nhận được. */
export async function teacherLogin(password) {
  const json = await apiFetch('/api/auth/teacher-login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  const token = json?.data?.token;
  if (!token) throw new Error('Server không trả về token giáo viên.');
  saveTeacherToken(token);
  return json.data;
}
