import { decodeJwt, isTokenExpired, type JwtPayload } from "./jwt";
import { STUDENT_TOKEN_STORAGE_KEY } from "./api-client";

function safe<T>(fn: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function saveToken(token: string) {
  safe(() => window.localStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, token), undefined);
}
export function getToken(): string | null {
  return safe(() => window.localStorage.getItem(STUDENT_TOKEN_STORAGE_KEY), null);
}
export function clearToken() {
  safe(() => window.localStorage.removeItem(STUDENT_TOKEN_STORAGE_KEY), undefined);
}

export function getCurrentUser(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || isTokenExpired(payload)) {
    clearToken();
    return null;
  }
  return payload;
}

export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}