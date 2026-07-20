import { apiFetch } from "./api-client";

export interface StudentSession {
  sessionId: string;
  title: string;
  publishedAt: string | null;
  deadline: string | null;
  classId: string;
  className: string | null;
  isOwnClass: boolean;
}

export interface AttemptHistoryItem {
  id: string;
  attempt_number: number;
  status: string;
  score: number;
  correct_count: number;
  total_questions: number;
  duration_seconds: number | null;
  passed: boolean;
  created_at: string;
  submitted_at: string | null;
}

export interface ExercisesPayload {
  flashcards: Array<{ id: string; word: string; meaning: string; example?: string }>;
  match_up: Array<{ id: string; term: string; definition: string }>;
  fill_in_blanks: Array<{
    id: string;
    direction: "en_to_vi" | "vi_to_en";
    word: string;
    answer: string;
  }>;
  mcqs: Array<{
    id: string;
    question: string;
    options: string[];
    correct_answer: string;
  }>;
}

export async function loginWithName(fullName: string) {
  const json = await apiFetch<{ token: string; student: unknown }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ full_name: fullName }),
    },
  );
  return { token: json.data.token, student: json.data.student };
}

export async function fetchStudentSessions(): Promise<StudentSession[]> {
  const json = await apiFetch<{ sessions: Array<Record<string, unknown>> }>(
    "/api/student/sessions",
  );
  return (json.data.sessions || []).map((s) => ({
    sessionId: s.id as string,
    title: s.title as string,
    publishedAt: (s.published_at as string) ?? null,
    deadline: (s.deadline as string) || null,
    classId: s.class_id as string,
    className: (s.class_name as string) || null,
    isOwnClass: (s.is_own_class as boolean) ?? true,
  }));
}

export async function fetchMyAttemptHistory(
  sessionId: string,
): Promise<AttemptHistoryItem[]> {
  const json = await apiFetch<Array<Record<string, unknown>>>(
    `/api/student/sessions/${sessionId}/attempts`,
  );
  return (json.data || []).map((a) => ({
    id: a.id as string,
    attempt_number: a.attempt_number as number,
    status: a.status as string,
    score: a.score as number,
    correct_count: a.correct_count as number,
    total_questions: a.total_questions as number,
    duration_seconds: (a.duration_seconds as number | null) ?? null,
    passed: a.status === "PASSED",
    created_at: (a.created_at as string) || (a.submitted_at as string),
    submitted_at: (a.submitted_at as string) || null,
  }));
}

export async function fetchAttemptDetail(attemptId: string) {
  const json = await apiFetch(`/api/student/attempts/${attemptId}`);
  return json.data;
}

export async function fetchSessionExercises(
  sessionId: string,
): Promise<ExercisesPayload> {
  const json = await apiFetch<{ exercises: ExercisesPayload }>(
    `/api/student/sessions/${sessionId}/exercises`,
  );
  return json.data.exercises;
}

export async function startAttempt(sessionId: string) {
  const json = await apiFetch<{ attempt_id: string }>("/api/attempts/start", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId }),
  });
  return json.data;
}

export async function updateAttemptStep(attemptId: string, step: number) {
  const json = await apiFetch("/api/attempts/update-step", {
    method: "PUT",
    body: JSON.stringify({ attempt_id: attemptId, step }),
  });
  return json.data;
}

export interface SubmitAnswers {
  match_up: Array<{ id: string; matched_id: string }>;
  fill_in_blanks: Array<{ id: string; student_answer: string }>;
  mcqs: Array<{ id: string; student_answer: string }>;
}

export interface SubmitResult {
  accuracy: number;
  status: string;
  correct_count: number;
  total_questions: number;
  results: Array<{
    id?: string;
    type?: string;
    is_correct: boolean;
    student_answer?: string;
    correct_answer?: string;
    correct_answer_id?: string;
    question?: string;
    sentence?: string;
    term?: string;
  }>;
}

export async function submitAttempt(
  attemptId: string,
  answers: SubmitAnswers,
  durationSeconds: number,
) {
  const json = await apiFetch<SubmitResult>("/api/attempts/submit", {
    method: "POST",
    body: JSON.stringify({
      attempt_id: attemptId,
      answers,
      duration_seconds: durationSeconds,
    }),
  });
  return json.data;
}