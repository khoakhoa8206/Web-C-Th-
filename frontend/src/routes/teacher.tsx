import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/vocab-ui";
import { TeacherLogin } from "@/components/teacher/teacher-login";
import { DashboardPanel } from "@/components/teacher/dashboard-panel";
import { StudentsPanel } from "@/components/teacher/students-panel";
import { SessionsPanel } from "@/components/teacher/sessions-panel";
import { AiGeneratorPanel } from "@/components/teacher/ai-generator-panel";
import {
  clearTeacherToken,
  isTeacherAuthenticated,
} from "@/lib/teacher-auth";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "Bảng điều khiển giáo viên — VocabHub" },
      {
        name: "description",
        content: "Quản lý lớp học, học sinh và tạo bài từ vựng bằng AI.",
      },
    ],
  }),
  component: TeacherPage,
});

type Tab = "dashboard" | "students" | "sessions" | "ai";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "students", label: "Học sinh", icon: "👥" },
  { id: "sessions", label: "Bài tập", icon: "📚" },
  { id: "ai", label: "AI Generator", icon: "✨" },
];

function TeacherPage() {
  const hydrated = useHydrated();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (hydrated) setAuthed(isTeacherAuthenticated());
  }, [hydrated]);

  if (!hydrated) return null;

  if (!authed) return <TeacherLogin onSuccess={() => setAuthed(true)} />;

  const handleLogout = () => {
    clearTeacherToken();
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-extrabold text-slate flex items-center gap-2"
          >
            <span className="h-8 w-8 rounded-xl bg-pink-400 text-white grid place-items-center shadow-button">
              V
            </span>
            <span>VocabHub · Giáo viên</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors " +
                (tab === t.id
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-slate/50 hover:text-slate")
              }
            >
              <span className="mr-1.5" aria-hidden="true">
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {tab === "dashboard" && <DashboardPanel />}
        {tab === "students" && <StudentsPanel />}
        {tab === "sessions" && <SessionsPanel />}
        {tab === "ai" && <AiGeneratorPanel />}
      </main>
    </div>
  );
}