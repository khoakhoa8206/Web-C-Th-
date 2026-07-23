import React, { useState } from "react";
import { Button } from "../ui";

/**
 * Bài 1 — FlashcardComponent
 * Thẻ lật từ vựng: mặt trước hiển thị từ tiếng Anh, click để lật ra mặt sau
 * gồm nghĩa tiếng Việt + phiên âm. Học sinh phải lật qua HẾT danh sách từ
 * (mỗi thẻ ít nhất 1 lần) mới được bấm "Tiếp theo".
 */
export default function FlashcardComponent({ vocabList, flippedIds, onFlip, onNext }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = vocabList.length;
  const current = vocabList[activeIndex];
  const allFlipped = flippedIds.length >= total;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    onFlip(current.id);
  };

  const goTo = (delta) => {
    setActiveIndex((prev) => Math.max(0, Math.min(total - 1, prev + delta)));
    setIsFlipped(false);
  };

  const isCurrentSeen = flippedIds.includes(current.id);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-slate/70">
        Đã lật {flippedIds.length}/{total} thẻ — lật hết để mở khoá bước tiếp theo
      </p>

      {/* Flashcard 3D flip */}
      <div className="flip-card-scene w-full max-w-xs h-52" onClick={handleFlip}>
        <div
          className={`flip-card-inner relative w-full h-full cursor-pointer ${
            isFlipped ? "is-flipped" : ""
          }`}
        >
          {/* Mặt trước — từ tiếng Anh */}
          <div className="flip-card-face absolute inset-0 rounded-3xl bg-white shadow-card border border-pink-100 flex flex-col items-center justify-center gap-2 p-6">
            {!isCurrentSeen && (
              <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-pink-300" aria-hidden="true" />
            )}
            <p className="text-5xl font-bold text-slate">{current.word}</p>
            <p className="text-sm text-slate font-medium">Chạm để xem nghĩa</p>
          </div>

          {/* Mặt sau — nghĩa tiếng Việt + phát âm */}
          <div className="flip-card-face flip-card-face-back absolute inset-0 rounded-3xl bg-pink-400 text-white shadow-card flex flex-col items-center justify-center gap-2 p-6">
            <p className="text-4xl font-bold">{current.meaning}</p>
            <p className="text-sm text-white/80">{current.phonetic}</p>
          </div>
        </div>
      </div>

      {/* Điều hướng thẻ */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" disabled={activeIndex === 0} onClick={() => goTo(-1)}>
          ← Trước
        </Button>
        <span className="text-xs text-slate/70 tabular-nums">
          {activeIndex + 1}/{total}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={activeIndex === total - 1}
          onClick={() => goTo(1)}
        >
          Sau →
        </Button>
      </div>

      <Button variant="primary" fullWidth disabled={!allFlipped} onClick={onNext}>
        {allFlipped ? "Tiếp theo →" : `Lật hết thẻ để tiếp tục (${total - flippedIds.length} còn lại)`}
      </Button>
    </div>
  );
}
