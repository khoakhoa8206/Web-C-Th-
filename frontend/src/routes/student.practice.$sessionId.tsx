import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PracticeFlow } from "@/components/practice/practice-flow";
import { useSessionExercises } from "@/hooks/use-session-exercises";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/student/practice/$sessionId")({
  head: () => ({
    meta: [
      { title: "Luyện tập từ vựng — VocabHub" },
      { name: "description", content: "Luyện tập từ vựng qua 4 bước." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { user, isHydrated } = useAuth();
  const { data, isLoading, error } = useSessionExercises(sessionId);

  useEffect(() => {
    if (isHydrated && !user) navigate({ to: "/student/login" });
  }, [isHydrated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-sm text-slate/50">Đang tải bài học…</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2">
          {error instanceof Error ? error.message : "Không tải được bài học."}
        </p>
      </div>
    );
  }
  return <PracticeFlow sessionId={sessionId} exercises={data} />;
}