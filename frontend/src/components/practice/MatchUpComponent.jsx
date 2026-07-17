import React, { useMemo, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button } from "../ui";
import { fisherYatesShuffle } from "../../utils/shuffle";

/**
 * Bài 2 — MatchUpComponent
 * Trò chơi nối từ: kéo thẻ tiếng Anh thả vào ô nghĩa tiếng Việt tương ứng.
 * Dùng @dnd-kit/core — nhẹ, hỗ trợ cả PointerSensor (chuột) lẫn
 * TouchSensor (cảm ứng di động) nên chạy tốt trên mobile.
 */

function DraggableWord({ id, label }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={[
        "w-full text-left px-4 py-3 rounded-2xl border font-semibold text-sm",
        "bg-white border-pink-200 text-slate shadow-sm touch-none select-none",
        "transition-transform",
        isDragging ? "opacity-70 scale-105 shadow-card-hover" : "hover:border-pink-400",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function DroppableSlot({ id, label, matchedWord, isCorrect, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const isMatched = Boolean(matchedWord);

  return (
    <div
      ref={setNodeRef}
      className={[
        "px-4 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold min-h-[52px]",
        "flex items-center justify-between gap-2 transition-colors duration-200",
        isMatched && isCorrect
          ? "bg-pink-50 border-pink-300 text-slate"
          : isMatched && !isCorrect
          ? "bg-danger-bg border-danger-text/40 text-danger-text"
          : isOver
          ? "bg-pink-100 border-pink-400 text-pink-600"
          : "bg-surface-soft border-surface-border text-slate/50",
        // Khi đang kéo 1 từ khác đè lên ô đã match, vẫn báo hiệu "thả được"
        isMatched && isOver ? "ring-2 ring-pink-400" : "",
      ].join(" ")}
    >
      <span>{label}</span>
      {isMatched && (
        <button
          type="button"
          aria-label={`Gỡ ghép "${matchedWord}"`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/70 hover:bg-white text-slate/60 hover:text-danger-text transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function MatchUpComponent({ vocabList, matchedPairs, onMatchChange, onNext }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  // Trộn thứ tự cột trái/phải một lần khi vào bài, giữ nguyên trong suốt bài này
  const [shuffledWords] = useState(() => fisherYatesShuffle(vocabList));
  const [shuffledMeanings] = useState(() => fisherYatesShuffle(vocabList));

  // matchedPairs: { [wordId]: meaningId } — có thể là ghép đúng hoặc sai,
  // mỗi wordId chỉ giữ 1 meaningId và ngược lại (đảm bảo trong handleDragEnd).
  const matchedIds = Object.keys(matchedPairs);
  const remainingWords = shuffledWords.filter((w) => !matchedIds.includes(w.id));
  const correctCount = Object.entries(matchedPairs).filter(([w, m]) => w === m).length;
  const allMatched = matchedIds.length === vocabList.length && correctCount === vocabList.length;

  const meaningToWord = useMemo(() => {
    const map = {};
    Object.entries(matchedPairs).forEach(([wordId, meaningId]) => {
      const word = vocabList.find((v) => v.id === wordId);
      map[meaningId] = word;
    });
    return map;
  }, [matchedPairs, vocabList]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const wordId = active.id;
    const meaningId = over.id;

    const nextPairs = { ...matchedPairs };
    // Nếu ô này đã có từ khác ghép sẵn ("kéo đè"), đá từ cũ ra khỏi ô
    // để nó quay lại cột bên trái (đơn giản là xoá entry của từ cũ).
    Object.keys(nextPairs).forEach((existingWordId) => {
      if (nextPairs[existingWordId] === meaningId && existingWordId !== wordId) {
        delete nextPairs[existingWordId];
      }
    });
    // Nếu từ đang kéo đã ghép ở ô khác trước đó, gỡ ghép cũ của nó
    delete nextPairs[wordId];
    // Ghép cặp mới (có thể đúng hoặc sai — học sinh có thể gỡ/kéo lại sau)
    nextPairs[wordId] = meaningId;

    onMatchChange(nextPairs);
  };

  const handleRemove = (meaningId) => {
    const nextPairs = { ...matchedPairs };
    Object.keys(nextPairs).forEach((wordId) => {
      if (nextPairs[wordId] === meaningId) {
        delete nextPairs[wordId];
      }
    });
    onMatchChange(nextPairs);
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate/50 text-center">
        Kéo từ tiếng Anh vào đúng ô nghĩa tiếng Việt · Đã nối đúng {correctCount}/{vocabList.length}
      </p>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {remainingWords.map((w) => (
              <DraggableWord key={w.id} id={w.id} label={w.word} />
            ))}
            {remainingWords.length === 0 && (
              <p className="text-center text-xs text-slate/30 py-4">Đã kéo hết từ! 🎉</p>
            )}
          </div>
          <div className="space-y-2">
            {shuffledMeanings.map((m) => (
              <DroppableSlot
                key={m.id}
                id={m.id}
                label={m.meaning}
                matchedWord={meaningToWord[m.id]?.word}
                isCorrect={m.id === meaningToWord[m.id]?.id}
                onRemove={() => handleRemove(m.id)}
              />
            ))}
          </div>
        </div>
      </DndContext>

      <div className="flex gap-3">
        <Button variant="primary" fullWidth disabled={!allMatched} onClick={onNext}>
          {allMatched ? "Tiếp theo →" : "Nối đúng hết các cặp để tiếp tục"}
        </Button>
      </div>
    </div>
  );
}
