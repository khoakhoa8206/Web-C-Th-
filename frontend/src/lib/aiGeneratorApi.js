import { teacherFetch } from './apiClient';

/**
 * AI Generator API — gọi backend Express để sinh bài tập bằng Gemini AI.
 * Thay thế mock và endpoint cũ.
 */

/**
 * Gọi backend soạn bài bằng AI (Gemini).
 * POST /api/teacher/generate-exercises
 * @param {string} vocabularyList - danh sách từ vựng (chuỗi, phân cách bằng dấu phẩy hoặc xuống dòng)
 * @param {string} classId - UUID lớp học
 * @returns {{ session_id, session_title, status, exercises }}
 */
export async function generateLessonFromVocab(vocabularyList, classId) {
  const json = await teacherFetch('/api/teacher/generate-exercises', {
    method: 'POST',
    body: JSON.stringify({ class_id: classId, vocabulary_list: vocabularyList }),
  });
  const data = json.data;
  return {
    ...data,
    // Các component editor dùng tên camel/legacy; backend giữ schema chuẩn.
    flashcards: data.exercises?.flashcards || [],
    matchup: data.exercises?.match_up || [],
    fillblanks: data.exercises?.fill_in_blanks || [],
    mcq: data.exercises?.mcqs || [],
  };
}

/**
 * Cập nhật nội dung bài tập (trước khi publish).
 * PUT /api/teacher/update-exercises/:session_id
 */
export async function updateExercises(sessionId, exercisesData, sessionTitle) {
  const json = await teacherFetch(`/api/teacher/update-exercises/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      session_title: sessionTitle,
      flashcards: exercisesData.flashcards || [],
      match_up: exercisesData.matchup || [],
      fill_in_blanks: exercisesData.fillblanks || [],
      mcqs: exercisesData.mcq || [],
    }),
  });
  return json.data;
}

/**
 * Giao bài cho học sinh (chuyển session sang PUBLISHED).
 * PUT /api/teacher/publish-session/:session_id
 */
export async function publishSession(sessionId, deadline) {
  const json = await teacherFetch(`/api/teacher/publish-session/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(deadline ? { deadline } : {}),
  });
  return json.data;
}

/**
 * Hẹn giờ tự động giao bài (chuyển session sang SCHEDULED).
 * PUT /api/teacher/schedule-session/:session_id
 */
export async function scheduleSession(sessionId, scheduledPublishAt, deadline) {
  const json = await teacherFetch(`/api/teacher/schedule-session/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      scheduled_publish_at: scheduledPublishAt,
      ...(deadline ? { deadline } : {}),
    }),
  });
  return json.data;
}

/**
 * Backward compat — saveLesson dùng trong AIGeneratorDashboard.
 * Map sang update + optional publish.
 */
export async function saveLesson(sessionId, lessonData, status, deadline) {
  await updateExercises(sessionId, lessonData);
  if (status === 'PUBLISHED') {
    await publishSession(sessionId, deadline || null);
  }
  return { session_id: sessionId, status };
}
