import { teacherFetch } from './apiClient';

/**
 * Attempts API — gọi backend Express thay vì Supabase trực tiếp.
 * Dùng polling thay cho Supabase Realtime.
 */

/** Lấy toàn bộ attempts của một session (dùng để build bảng dashboard + đếm attempts). */
export async function fetchAttemptsForSession(sessionId) {
  const json = await teacherFetch(`/api/teacher/attempts?session_id=${sessionId}`);
  return (json.data || []).map((a) => ({
    id: a.id,
    student_id: a.student_id,
    session_id: a.session_id,
    attempt_number: a.attempt_number,
    score: a.score,
    passed: a.status === 'PASSED',
    correct_count: a.correct_count,
    total_questions: a.total_questions,
    duration_seconds: a.duration_seconds,
    created_at: a.created_at || a.submitted_at,
  }));
}

/** Lịch sử làm bài của 1 học sinh trong 1 session. */
export async function fetchStudentHistory(studentId, sessionId) {
  const allAttempts = await fetchAttemptsForSession(sessionId);
  return allAttempts
    .filter((a) => a.student_id === studentId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

/**
 * Polling-based subscription — thay thế Supabase Realtime.
 * Trả về hàm huỷ đăng ký (unsubscribe).
 */
export function subscribeToAttempts(sessionId, onEvent) {
  let active = true;
  let lastKnownIds = new Set();

  const poll = async () => {
    if (!active) return;
    try {
      const attempts = await fetchAttemptsForSession(sessionId);
      attempts.forEach((a) => {
        if (!lastKnownIds.has(a.id)) {
          lastKnownIds.add(a.id);
          onEvent({ eventType: 'INSERT', new: a });
        }
      });
    } catch (err) {
      console.warn('[subscribeToAttempts] polling error:', err.message);
    }
    if (active) setTimeout(poll, 3000);
  };

  poll();

  return () => {
    active = false;
  };
}
