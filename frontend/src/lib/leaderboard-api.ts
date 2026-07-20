const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  const json = await res.json().catch(() => ({
    success: false,
    message: "Lỗi phân tích phản hồi từ server.",
  }));
  if (!json.success) throw new Error(json.message || "Lỗi tải dữ liệu");
  return json.data as T;
}

export interface LeaderboardClass {
  id: string;
  name: string;
}
export interface LeaderboardSession {
  id: string;
  title: string;
}
export interface LeaderboardEntry {
  student_id: string;
  full_name: string;
  rank: number;
  best_score: number;
  best_duration: number | null;
  total_attempts: number;
}
export interface LeaderboardResponse {
  class_name: string;
  session_title: string;
  ranked: LeaderboardEntry[];
}

export const fetchLeaderboardClasses = () =>
  publicFetch<LeaderboardClass[]>("/api/leaderboard/classes");

export const fetchLeaderboardSessions = (classId: string) =>
  publicFetch<LeaderboardSession[]>(
    `/api/leaderboard/sessions${classId ? `?class_id=${classId}` : ""}`,
  );

export const fetchLeaderboard = (sessionId: string) =>
  publicFetch<LeaderboardResponse>(`/api/leaderboard?session_id=${sessionId}`);