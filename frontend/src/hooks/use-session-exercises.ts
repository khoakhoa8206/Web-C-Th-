import { useQuery } from "@tanstack/react-query";
import { fetchSessionExercises } from "@/lib/student-api";

export function useSessionExercises(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session-exercises", sessionId],
    queryFn: () => fetchSessionExercises(sessionId!),
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}