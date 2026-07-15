import { apiFetch } from './apiClient';

/**
 * Student Practice API — gọi backend Express thật.
 * Thay thế toàn bộ MOCK data cũ bằng real API calls.
 */

/**
 * Đăng nhập bằng Họ và Tên.
 * POST /api/auth/login
 */
export async function loginWithName(fullName) {
  const json = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ full_name: fullName }),
  });
  return { token: json.data.token, student: json.data.student };
}

/**
 * Lấy danh sách session PUBLISHED của lớp học sinh.
 * GET /api/student/sessions (class_id tự lấy từ JWT trên server)
 */
export async function fetchStudentSessions() {
  const json = await apiFetch('/api/student/sessions');
  return (json.data.sessions || []).map((s) => ({
    sessionId: s.id,
    title: s.title,
    publishedAt: s.published_at,
  }));
}

/**
 * Backward compat — SessionListPage gọi fetchGradeSessions(gradeId).
 * gradeId không còn cần thiết vì server tự lọc theo class_id trong JWT.
 */
export async function fetchGradeSessions() {
  return fetchStudentSessions();
}

/**
 * Lấy nội dung bài tập (exercises) của 1 session.
 * GET /api/student/sessions/:session_id/exercises
 */
export async function fetchSessionExercises(sessionId) {
  const json = await apiFetch(`/api/student/sessions/${sessionId}/exercises`);
  return json.data.exercises;
}

/**
 * Backward compat — useSessionVocab gọi fetchSessionVocab.
 * Trả về flashcards dưới dạng vocabList format.
 */
export async function fetchSessionVocab(sessionId) {
  const exercises = await fetchSessionExercises(sessionId);
  return (exercises.flashcards || []).map((f) => ({
    id: f.id,
    word: f.word,
    meaning: f.meaning,
    phonetic: '',
    example: f.example || '',
  }));
}

/** MCQ questions giờ nằm trong exercises.mcqs, không cần fetch riêng. */
export async function fetchMcqQuestions() {
  return [];
}

/**
 * Bắt đầu lượt làm bài.
 * POST /api/attempts/start
 */
export async function startAttempt(sessionId) {
  const json = await apiFetch('/api/attempts/start', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
  return json.data;
}

/**
 * Cập nhật bước làm bài (chống gian lận).
 * PUT /api/attempts/update-step
 */
export async function updateAttemptStep(attemptId, step) {
  const json = await apiFetch('/api/attempts/update-step', {
    method: 'PUT',
    body: JSON.stringify({ attempt_id: attemptId, step }),
  });
  return json.data;
}

/**
 * Nộp bài — server chấm điểm.
 * POST /api/attempts/submit
 */
export async function submitAttempt(attemptId, answers, durationSeconds) {
  const json = await apiFetch('/api/attempts/submit', {
    method: 'POST',
    body: JSON.stringify({
      attempt_id: attemptId,
      answers,
      duration_seconds: durationSeconds,
    }),
  });
  return json.data;
}
