import { useEffect, useState, useCallback, useRef } from "react";
import { fetchAttemptsForSession, subscribeToAttempts } from "../lib/attemptsApi";

/**
 * useAttemptsRealtime — nguồn dữ liệu chính cho Master Dashboard.
 *
 * Trả về map theo student_id: { latestAttempt, attemptsCount, justUpdated }.
 * `justUpdated` bật true trong 1.2s sau khi có sự kiện realtime mới, để
 * StudentRow có thể áp animate nhấp nháy nhẹ rồi tự tắt.
 */
export function useAttemptsRealtime(sessionId) {
  const [attemptsByStudent, setAttemptsByStudent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const flashTimers = useRef({});

  const rebuildFromList = useCallback((attempts) => {
    const map = {};
    attempts.forEach((a) => {
      const existing = map[a.student_id];
      const count = (existing?.attemptsCount ?? 0) + 1;
      const isNewer =
        !existing || new Date(a.created_at) >= new Date(existing.latestAttempt.created_at);
      map[a.student_id] = {
        latestAttempt: isNewer ? a : existing.latestAttempt,
        attemptsCount: count,
        justUpdated: false,
      };
    });
    return map;
  }, []);

  useEffect(() => {
    if (!sessionId) return undefined;
    let cancelled = false;
    setIsLoading(true);

    fetchAttemptsForSession(sessionId).then((attempts) => {
      if (!cancelled) {
        setAttemptsByStudent(rebuildFromList(attempts));
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId, rebuildFromList]);

  useEffect(() => {
    if (!sessionId) return undefined;

    const unsubscribe = subscribeToAttempts(sessionId, ({ new: attempt }) => {
      setAttemptsByStudent((prev) => {
        const existing = prev[attempt.student_id];
        const attemptsCount = existing
          ? existing.latestAttempt.id === attempt.id
            ? existing.attemptsCount
            : existing.attemptsCount + 1
          : 1;
        return {
          ...prev,
          [attempt.student_id]: {
            latestAttempt: attempt,
            attemptsCount,
            justUpdated: true,
          },
        };
      });

      // Tự tắt hiệu ứng nhấp nháy sau 1.2s
      clearTimeout(flashTimers.current[attempt.student_id]);
      flashTimers.current[attempt.student_id] = setTimeout(() => {
        setAttemptsByStudent((prev) => {
          if (!prev[attempt.student_id]) return prev;
          return {
            ...prev,
            [attempt.student_id]: { ...prev[attempt.student_id], justUpdated: false },
          };
        });
      }, 1200);
    });

    return () => {
      unsubscribe();
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, [sessionId]);

  return { attemptsByStudent, isLoading };
}
