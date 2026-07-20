/**
 * apiClient — helper fetch dùng chung cho mọi lời gọi tới Express backend
 * (self-hosted). Tự thêm Authorization: Bearer <token> lấy từ localStorage.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const STUDENT_TOKEN_KEY = "stu_token";
const TEACHER_TOKEN_KEY = "teacher_token";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getActiveToken(): string | null {
  return safeGet(STUDENT_TOKEN_KEY) || safeGet(TEACHER_TOKEN_KEY);
}

export function getStudentToken(): string | null {
  return safeGet(STUDENT_TOKEN_KEY);
}

export function getTeacherToken(): string | null {
  return safeGet(TEACHER_TOKEN_KEY);
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data: T; message?: string }> {
  const token = getActiveToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({
    success: false,
    message: "Lỗi phân tích phản hồi từ server.",
  }));
  if (!res.ok) {
    throw new Error(json.message || `Lỗi ${res.status} từ server.`);
  }
  return json;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const STUDENT_TOKEN_STORAGE_KEY = STUDENT_TOKEN_KEY;
export const TEACHER_TOKEN_STORAGE_KEY = TEACHER_TOKEN_KEY;