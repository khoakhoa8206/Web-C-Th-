import React from "react";

/**
 * Bước 2 — Loading nhẹ nhàng tông hồng pastel trong lúc backend gọi Gemini API.
 */
export default function LoadingStep() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-pink-100" />
        <div className="absolute inset-0 rounded-full border-4 border-pink-400 border-t-transparent animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-xl">✨</span>
      </div>
      <p className="text-sm font-semibold text-pink-600">AI đang soạn bài cho bạn...</p>
      <p className="text-xs text-slate/40">Đang dựng Flashcard, Nối từ, Điền từ và Trắc nghiệm</p>
    </div>
  );
}
