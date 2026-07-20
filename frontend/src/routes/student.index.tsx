import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, CardContainer } from "@/components/vocab-ui";
import { useAuth } from "@/hooks/use-auth";
import { fetchStudentSessions } from "@/lib/student-api";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Danh sách buổi học — VocabHub" },
      { name: "description", content: "Chọn buổi học từ vựng để luyện tập." },
    ],
  }),
  component: StudentHome,
});

function StudentHome() {
  const navigate = useNavigate();
  const { user, isHydrated, logout } = useAuth();

  useEffect(() => {
    if (isHydrated && !user) navigate({ to: "/student/login" });
  }, [isHydrated, user, navigate]);

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["student-sessions"],
    queryFn: fetchStudentSessions,
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate/40">Xin chào</p>
            <h1 className="text-xl font-bold text-slate">
              {(user?.full_name || user?.name || "Học sinh") as string}
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Đăng xuất
          </Button>
        </header>

        <h2 className="text-sm font-bold text-slate/60 uppercase tracking-wide mb-3">
          Buổi học của bạn
        </h2>

        {isLoading && <p className="text-sm text-slate/50">Đang tải…</p>}
        {error && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2">
            {(error as Error).message}
          </p>
        )}

        <div className="space-y-3">
          {(sessions || []).map((s) => (
            <Link
              key={s.sessionId}
              to="/student/practice/$sessionId"
              params={{ sessionId: s.sessionId }}
            >
              <CardContainer hoverable>
                <p className="font-bold text-slate">{s.title}</p>
                <p className="text-xs text-slate/50 mt-1">
                  {s.className || "Lớp của bạn"}
                  {s.deadline ? ` · Hạn: ${new Date(s.deadline).toLocaleDateString("vi-VN")}` : ""}
                </p>
              </CardContainer>
            </Link>
          ))}
          {sessions && sessions.length === 0 && (
            <p className="text-sm text-slate/50 text-center py-8">
              Chưa có buổi học nào được giao.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}