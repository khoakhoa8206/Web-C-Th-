import { useState } from "react";
import { Button } from "@/components/vocab-ui";

export interface FlashVocab {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string;
}

export interface FlashcardComponentProps {
  vocabList: FlashVocab[];
  flippedIds: string[];
  onFlip: (id: string) => void;
  onNext: () => void;
}

export function FlashcardComponent({
  vocabList,
  flippedIds,
  onFlip,
  onNext,
}: FlashcardComponentProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = vocabList.length;
  const current = vocabList[activeIndex];
  const allFlipped = flippedIds.length >= total;

  if (!current) return null;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    onFlip(current.id);
  };

  const goTo = (delta: number) => {
    setActiveIndex((prev) => Math.max(0, Math.min(total - 1, prev + delta)));
    setIsFlipped(false);
  };

  const isCurrentSeen = flippedIds.includes(current.id);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-slate/50">
        Đã lật {flippedIds.length}/{total} thẻ — lật hết để mở khoá bước tiếp theo
      </p>

      <div className="flip-scene w-full max-w-xs h-52" onClick={handleFlip}>
        <div
          className={`flip-inner relative w-full h-full cursor-pointer ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="flip-face absolute inset-0 rounded-3xl bg-white shadow-card border border-pink-100 flex flex-col items-center justify-center gap-2 p-6">
            {!isCurrentSeen && (
              <span
                className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-pink-300"
                aria-hidden="true"
              />
            )}
            <p className="text-2xl font-bold text-slate">{current.word}</p>
            <p className="text-xs text-slate/40">Chạm để xem nghĩa</p>
          </div>
          <div className="flip-face-back absolute inset-0 rounded-3xl bg-pink-400 text-white shadow-card flex flex-col items-center justify-center gap-2 p-6">
            <p className="text-2xl font-bold">{current.meaning}</p>
            <p className="text-sm text-white/80">{current.phonetic}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" disabled={activeIndex === 0} onClick={() => goTo(-1)}>
          ← Trước
        </Button>
        <span className="text-xs text-slate/40 tabular-nums">
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
        {allFlipped
          ? "Tiếp theo →"
          : `Lật hết thẻ để tiếp tục (${total - flippedIds.length} còn lại)`}
      </Button>
    </div>
  );
}