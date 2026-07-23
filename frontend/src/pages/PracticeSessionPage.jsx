import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSessionExercises } from "../hooks/useSessionVocab";
import PracticeFlow from "../components/practice/PracticeFlow";

export default function PracticeSessionPage() {
  const { sessionId } = useParams();
  const { data: exercises, isLoading, isError, error } = useSessionExercises(sessionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-slate-900 text-sm">Đang tải bài tập...</p>
      </div>
    );
  }

  if (isError || !exercises) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-danger-text font-semibold">
          Không thể tải dữ liệu bài tập. {error?.message}
        </p>
        <Link to="/student" className="text-pink-600 text-sm font-semibold">
          ← Quay về trang chủ
        </Link>
      </div>
    );
  }

  return <PracticeFlow sessionId={sessionId} exercises={exercises} />;
}
