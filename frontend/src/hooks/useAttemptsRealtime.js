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
      // Ưu tiên attempt đã đạt (passed) với điểm cao nhất.
      // Nếu không có attempt nào đạt, lấy attempt điểm cao nhất.
      const prev = existing?.bestAttempt;
      let best;
      if (!prev) {
        best = a;
      } else if (a.passed && !prev.passed) {
        best = a; // a đạt, prev chưa → a thắng
      } else if (!a.passed && prev.passed) {
        best = prev; // prev đạt, a chưa → prev thắng
      } else {
        // cùng trạng thái → lấy điểm cao hơn
        best = (a.score ?? 0) >= (prev.score ?? 0) ? a : prev;
      }
      map[a.student_id] = {
        bestAttempt: best,
        latestAttempt: best, // alias để StudentRow không đổi
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
        const isNewId = !existing || existing.bestAttempt?.id !== attempt.id;
        const attemptsCount = existing
          ? isNewId ? existing.attemptsCount + 1 : existing.attemptsCount
          : 1;
        // Tính best giữa existing.bestAttempt và attempt mới
        const prevBest = existing?.bestAttempt;
        let best;
        if (!prevBest) {
          best = attempt;
        } else if (attempt.passed && !prevBest.passed) {
          best = attempt;
        } else if (!attempt.passed && prevBest.passed) {
          best = prevBest;
        } else {
          best = (attempt.score ?? 0) >= (prevBest.score ?? 0) ? attempt : prevBest;
        }
        return {
          ...prev,
          [attempt.student_id]: {
            bestAttempt: best,
            latestAttempt: best,
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
