import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, Button, CardContainer, InputField } from "../components/ui";
import { clearTeacherToken, isTeacherAuthenticated, teacherLogin } from "../lib/teacherAuth";
import DashboardPage from "./DashboardPage";
import ManageStudentsPage from "./ManageStudentsPage";
import AIGeneratorDashboard from "./AIGeneratorDashboard";
import ManageSessionsPage from "./ManageSessionsPage";
import LeaderboardPage from "./LeaderboardPage";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "students", label: "Quản lý học sinh", icon: "🧑‍🎓" },
  { id: "sessions", label: "Quản lý bài tập", icon: "📝" },
  { id: "leaderboard", label: "Xếp hạng", icon: "🏆" },
  { id: "ai-generator", label: "Soạn bài bằng AI", icon: "✨" },
];

/** TeacherApp — vỏ điều hướng Teacher View, mounted tại route /teacher/*. */
export default function TeacherApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authenticated, setAuthenticated] = useState(() => isTeacherAuthenticated());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      await teacherLogin(password);
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err.message || "Không thể đăng nhập.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center p-6">
        <CardContainer className="w-full max-w-sm">
          <Link to="/" className="text-xs text-slate/70 hover:text-pink-600">← Trang chủ</Link>
          <h1 className="font-extrabold text-slate text-xl mt-4">Đăng nhập giáo viên</h1>
          <p className="text-sm text-slate/70 mt-1 mb-6">Nhập mật khẩu được cấu hình trên server.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <InputField label="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={error} autoFocus />
            <Button type="submit" variant="primary" fullWidth isLoading={isLoggingIn}>Đăng nhập</Button>
          </form>
        </CardContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft">
      <header className="bg-white border-b border-surface-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div>
            <Link to="/" className="text-xs text-slate/70 hover:text-pink-600">
              ← Trang chủ
            </Link>
            <h1 className="font-extrabold text-slate text-lg">Teacher Dashboard</h1>
            <p className="text-xs text-slate/70">Theo dõi tiến độ học sinh theo thời gian thực</p>
          </div>
          <Tabs items={TABS} activeId={activeTab} onChange={setActiveTab} className="sm:w-auto" />
          <Button variant="secondary" onClick={() => { clearTeacherToken(); setAuthenticated(false); }}>
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "dashboard" && <DashboardPage />}
        {activeTab === "students" && <ManageStudentsPage />}
        {activeTab === "sessions" && <ManageSessionsPage />}
        {activeTab === "leaderboard" && <LeaderboardPage />}
        {activeTab === "ai-generator" && <AIGeneratorDashboard />}
      </main>
    </div>
  );
}
