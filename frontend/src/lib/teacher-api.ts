import { apiFetch } from "./api-client";

export interface ClassRow {
  id: string;
  name: string;
}

export interface StudentRow {
  id: string;
  full_name: string;
  class_id: string;
}

export type SessionStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export interface SessionRow {
  id: string;
  class_id: string;
  title: string;
  status: SessionStatus;
  published_at?: string | null;
  deadline?: string | null;
  scheduled_publish_at?: string | null;
}

export interface AttemptRow {
  id: string;
  student_id: string;
  session_id: string;
  score: number;
  passed: boolean;
  created_at: string;
}

// ------- Classes -------
export async function fetchClasses(): Promise<ClassRow[]> {
  const json = await apiFetch<ClassRow[]>("/api/teacher/classes");
  return json.data || [];
}

export async function createClass(name: string): Promise<ClassRow> {
  const json = await apiFetch<ClassRow>("/api/teacher/classes", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return json.data;
}

export async function deleteClass(id: string) {
  await apiFetch(`/api/teacher/classes/${id}`, { method: "DELETE" });
}

// ------- Students -------
export async function fetchStudents(classId?: string): Promise<StudentRow[]> {
  const url = classId
    ? `/api/teacher/students?class_id=${classId}`
    : "/api/teacher/students";
  const json = await apiFetch<StudentRow[]>(url);
  return json.data || [];
}

export async function createStudent(payload: {
  full_name: string;
  class_id: string;
}): Promise<StudentRow> {
  const json = await apiFetch<StudentRow>("/api/teacher/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
}

export async function updateStudent(
  id: string,
  patch: Partial<Pick<StudentRow, "full_name" | "class_id">>,
): Promise<StudentRow> {
  const json = await apiFetch<StudentRow>(`/api/teacher/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return json.data;
}

export async function deleteStudent(id: string) {
  await apiFetch(`/api/teacher/students/${id}`, { method: "DELETE" });
}

// ------- Sessions -------
export async function fetchSessionsForClass(
  classId: string,
): Promise<SessionRow[]> {
  if (!classId) return [];
  const json = await apiFetch<SessionRow[]>(
    `/api/teacher/sessions?class_id=${classId}`,
  );
  return json.data || [];
}

export async function updateSession(
  id: string,
  patch: { title?: string; deadline?: string | null },
) {
  const json = await apiFetch(`/api/teacher/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return json.data;
}

export async function deleteSession(id: string) {
  await apiFetch(`/api/teacher/sessions/${id}`, { method: "DELETE" });
}

export async function publishSession(id: string, deadline?: string | null) {
  const json = await apiFetch(`/api/teacher/publish-session/${id}`, {
    method: "PUT",
    body: JSON.stringify(deadline ? { deadline } : {}),
  });
  return json.data;
}

// ------- Attempts -------
export async function fetchAttemptsForSession(
  sessionId: string,
): Promise<AttemptRow[]> {
  const json = await apiFetch<AttemptRow[]>(
    `/api/teacher/attempts?session_id=${sessionId}`,
  );
  return json.data || [];
}

// ------- AI Generator -------
export interface GeneratedLesson {
  session_id: string;
  session_title: string;
  status: SessionStatus;
  exercises: {
    flashcards: Array<{ id: string; word: string; meaning: string; example?: string }>;
    match_up: Array<{ id: string; term: string; definition: string }>;
    fill_in_blanks: Array<{ id: string; sentence: string; correct_answer: string }>;
    mcqs: Array<{
      id: string;
      question: string;
      options: string[];
      correct_answer: string;
    }>;
  };
}

export async function generateLessonFromVocab(
  vocabularyList: string,
  classId: string,
): Promise<GeneratedLesson> {
  const json = await apiFetch<GeneratedLesson>(
    "/api/teacher/generate-exercises",
    {
      method: "POST",
      body: JSON.stringify({
        class_id: classId,
        vocabulary_list: vocabularyList,
      }),
    },
  );
  return json.data;
}

export async function updateExercises(
  sessionId: string,
  exercises: GeneratedLesson["exercises"],
  sessionTitle?: string,
) {
  const json = await apiFetch(`/api/teacher/update-exercises/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(sessionTitle ? { session_title: sessionTitle } : {}),
      flashcards: exercises.flashcards || [],
      match_up: exercises.match_up || [],
      fill_in_blanks: exercises.fill_in_blanks || [],
      mcqs: exercises.mcqs || [],
    }),
  });
  return json.data;
}