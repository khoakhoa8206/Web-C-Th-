import { useQuery } from "@tanstack/react-query";
import { fetchSessionExercises } from "../lib/studentPracticeApi";

/**
 * useSessionExercises — tải nội dung bài tập (exercises) của một session từ backend.
 *
 * - React Query cache theo `session_id`, staleTime 10 phút
 * - Trả về exercises object: { flashcards, match_up, fill_in_blanks, mcqs }
 */
export function useSessionExercises(sessionId) {
  return useQuery({
    queryKey: ["session-exercises", sessionId],
    queryFn: () => fetchSessionExercises(sessionId),
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/**
 * useSessionVocab — backward compat hook.
 * Trả về flashcards dưới dạng vocabList format.
 */
export function useSessionVocab(sessionId) {
  const query = useSessionExercises(sessionId);
  return {
    ...query,
    data: query.data
      ? (query.data.flashcards || []).map((f) => ({
          id: f.id,
          word: f.word,
          meaning: f.meaning,
          phonetic: "",
          example: f.example || "",
        }))
      : undefined,
  };
}
