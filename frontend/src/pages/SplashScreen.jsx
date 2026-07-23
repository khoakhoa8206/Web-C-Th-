import React, { useEffect, useState } from "react";

/**
 * SplashScreen — hiện khi đang chờ backend Render (free tier) cold-start.
 * Props:
 * - hasError: true khi đã hết số lần thử mà server vẫn chưa phản hồi
 * - onRetry: hàm gọi lại khi bấm "Thử lại"
 */
export default function SplashScreen({ hasError, onRetry }) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center gap-6 p-6">
      <p className="text-4xl">🌸</p>
      {!hasError ? (
        <>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-pink-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-slate">Đang kết nối tới server…</p>
          {showHint && (
            <p className="text-xs text-slate-900 text-center max-w-xs">
              Server đang cold-start sau thời gian không hoạt động, có thể mất 30–60 giây. Vui lòng chờ…
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate">Không thể kết nối tới server</p>
          <p className="text-xs text-slate-900">Kiểm tra kết nối mạng hoặc thử lại sau.</p>
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-2xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition-colors"
          >
            Thử lại
          </button>
        </>
      )}
    </div>
  );
}
