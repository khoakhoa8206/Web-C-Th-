import { decodeJwt, isTokenExpired, type JwtPayload } from "./jwt";
import { apiFetch, TEACHER_TOKEN_STORAGE_KEY } from "./api-client";

function safe<T>(fn: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function saveTeacherToken(token: string) {
  safe(
    () => window.localStorage.setItem(TEACHER_TOKEN_STORAGE_KEY, token),
    undefined,
  );
}

export function getTeacherToken(): string | null {
  return safe(
    () => window.localStorage.getItem(TEACHER_TOKEN_STORAGE_KEY),
    null,
  );
}

export function clearTeacherToken() {
  safe(
    () => window.localStorage.removeItem(TEACHER_TOKEN_STORAGE_KEY),
    undefined,
  );
}

export function getCurrentTeacher(): JwtPayload | null {
  const token = getTeacherToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || isTokenExpired(payload)) {
    clearTeacherToken();
    return null;
  }
  return payload;
}

export function isTeacherAuthenticated(): boolean {
  return !!getCurrentTeacher();
}

export async function teacherLogin(password: string) {
  const json = await apiFetch<{ token: string }>("/api/auth/teacher-login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  const token = json?.data?.token;
  if (!token) throw new Error("Server không trả về token giáo viên.");
  saveTeacherToken(token);
  return json.data;
}