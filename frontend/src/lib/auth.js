import { decodeJwt, isTokenExpired } from "../utils/jwt";

const TOKEN_KEY = "stu_token";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Trả về payload đã giải mã nếu token còn hợp lệ, ngược lại trả về null. */
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || isTokenExpired(payload)) {
    clearToken();
    return null;
  }
  return payload;
}

export function isAuthenticated() {
  return !!getCurrentUser();
}
