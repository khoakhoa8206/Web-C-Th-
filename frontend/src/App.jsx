import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleSelectPage from "./pages/RoleSelectPage";
import SplashScreen from "./pages/SplashScreen";
import { checkServerHealth } from "./lib/apiClient";

// Tải theo route (code-splitting) — Student View và Teacher View không cần
// tải chung 1 bundle, giúp trang chọn vai trò ban đầu load nhanh hơn.
const LoginPage = lazy(() => import("./pages/LoginPage"));
const GradeSelectPage = lazy(() => import("./pages/GradeSelectPage"));
const SessionListPage = lazy(() => import("./pages/SessionListPage"));
const PracticeSessionPage = lazy(() => import("./pages/PracticeSessionPage"));
const TeacherApp = lazy(() => import("./pages/TeacherApp"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <p className="text-sm text-slate/70">Đang tải...</p>
    </div>
  );
}

/**
 * App — router gốc, gộp cả Student View và Teacher View trong cùng 1 dự án.
 *
 *   /                                       → chọn vai trò
 *   /student/login                          → đăng nhập học sinh
 *   /student                                → chọn khối lớp (cần đăng nhập)
 *   /student/grades/:gradeId/sessions       → chọn buổi học
 *   /student/practice/:sessionId            → làm bài 4 bước
 *   /teacher/*                              → Master Dashboard giáo viên
 */
export default function App() {
  const [serverReady, setServerReady] = useState(false);
  const [serverError, setServerError] = useState(false);
  const pollRef = useRef(null);

  const startPolling = useCallback(() => {
    setServerError(false);
    let attempts = 0;
    const MAX = 20;
    const poll = async () => {
      const ok = await checkServerHealth();
      if (ok) {
        setServerReady(true);
        return;
      }
      attempts++;
      if (attempts >= MAX) {
        setServerError(true);
        return;
      }
      pollRef.current = setTimeout(poll, 3000);
    };
    poll();
  }, []);

  useEffect(() => {
    startPolling();
    return () => clearTimeout(pollRef.current);
  }, [startPolling]);

  if (!serverReady) {
    return <SplashScreen hasError={serverError} onRetry={startPolling} />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />

          {/* ---------------- Student View ---------------- */}
          <Route path="/student/login" element={<LoginPage />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <GradeSelectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/sessions"
            element={
              <ProtectedRoute>
                <SessionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/grades/:gradeId/sessions"
            element={
              <ProtectedRoute>
                <SessionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/practice/:sessionId"
            element={
              <ProtectedRoute>
                <PracticeSessionPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- Bảng xếp hạng (public, không cần đăng nhập) ---------------- */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* ---------------- Teacher View ---------------- */}
          <Route path="/teacher/*" element={<TeacherApp />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
