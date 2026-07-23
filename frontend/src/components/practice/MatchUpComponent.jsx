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
 * Bài 2 — MatchUpComponent v2
 * Trò chơi nối từ: kéo thẻ tiếng Anh thả vào ô nghĩa tiếng Việt tương ứng.
 * 
 * Improvements:
 * 1. Tối ưu drag-drop animations: transform: translate3d, will-change, GPU acceleration
 * 2. Click-to-select mode: Cho phép click vào từ → chọn ô → ghép
 * 3. Visual feedback: Shadow tăng, glow effect, scale animations khi kéo
 */

function DraggableWord({ id, label, isDragMode, isSelected, onSelectWord }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  
  const style = transform && isDragMode
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const dragModeClasses = isDragMode
    ? "cursor-grab active:cursor-grabbing"
    : "cursor-pointer";

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...(isDragMode ? listeners : {})}
      {...(isDragMode ? attributes : {})}
      onClick={() => !isDragMode && onSelectWord(id)}
      className={[
        "w-full text-left px-4 py-3 rounded-2xl border font-semibold text-sm",
        "bg-white border-pink-200 text-slate shadow-sm touch-none select-none",
        "transition-all duration-200 will-change-transform",
        isDragMode && isDragging 
          ? "opacity-80 scale-110 shadow-lg ring-2 ring-pink-400 ring-offset-2" 
          : isDragMode
          ? "hover:border-pink-400 hover:shadow-md"
          : isSelected
          ? "bg-pink-100 border-pink-500 ring-2 ring-pink-400"
          : "hover:bg-pink-50",
        dragModeClasses,
      ].join(" ")}
      aria-pressed={isSelected && !isDragMode}
    >
      {label}
      {isSelected && !isDragMode && <span className="ml-2 text-pink-600">✓</span>}
    </button>
  );
}

function DroppableSlot({ id, label, matchedWord, isCorrect, onRemove, isDragMode, isHoverTarget, onClickSlot }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const isMatched = Boolean(matchedWord);

  return (
    <div
      ref={setNodeRef}
      onClick={() => !isDragMode && onClickSlot && onClickSlot(id)}
      className={[
        "px-4 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold min-h-[52px]",
        "flex items-center justify-between gap-2 transition-all duration-200",
        !isDragMode && "cursor-pointer",
        isMatched && isCorrect
          ? "bg-pink-50 border-pink-300 text-slate"
          : isMatched && !isCorrect
          ? "bg-danger-bg border-danger-text/40 text-danger-text"
          : isOver && isDragMode
          ? "bg-pink-100 border-pink-400 text-pink-600 ring-2 ring-pink-400 shadow-md"
          : !isDragMode && isHoverTarget
          ? "bg-pink-100 border-pink-400 ring-2 ring-pink-400"
          : "bg-surface-soft border-surface-border text-slate/50",
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

  // Input mode: "drag" hoặc "clickSelect"
  const [inputMode, setInputMode] = useState("drag");
  const [selectedWordId, setSelectedWordId] = useState(null);

  // Trộn thứ tự cột trái/phải một lần khi vào bài
  const [shuffledWords] = useState(() => fisherYatesShuffle(vocabList));
  const [shuffledMeanings] = useState(() => fisherYatesShuffle(vocabList));

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

  // ---- DRAG MODE ----
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const wordId = active.id;
    const meaningId = over.id;

    const nextPairs = { ...matchedPairs };
    Object.keys(nextPairs).forEach((existingWordId) => {
      if (nextPairs[existingWordId] === meaningId && existingWordId !== wordId) {
        delete nextPairs[existingWordId];
      }
    });
    delete nextPairs[wordId];
    nextPairs[wordId] = meaningId;

    onMatchChange(nextPairs);
  };

  // ---- CLICK-SELECT MODE ----
  const handleSelectWord = (wordId) => {
    if (selectedWordId === wordId) {
      setSelectedWordId(null);
    } else {
      setSelectedWordId(wordId);
    }
  };

  const handleClickSlot = (meaningId) => {
    if (selectedWordId) {
      const nextPairs = { ...matchedPairs };
      // Gỡ ghép cũ của từ này (nếu có)
      delete nextPairs[selectedWordId];
      // Gỡ ghép cũ của ô này (nếu có)
      Object.keys(nextPairs).forEach((existingWordId) => {
        if (nextPairs[existingWordId] === meaningId) {
          delete nextPairs[existingWordId];
        }
      });
      // Ghép cặp mới
      nextPairs[selectedWordId] = meaningId;
      onMatchChange(nextPairs);
      setSelectedWordId(null);
    }
  };

  const handleRemove = (meaningId) => {
    const nextPairs = { ...matchedPairs };
    Object.keys(nextPairs).forEach((wordId) => {
      if (nextPairs[wordId] === meaningId) {
        delete nextPairs[wordId];
      }
    });
    onMatchChange(nextPairs);
    if (selectedWordId && !matchedIds.includes(selectedWordId)) {
      setSelectedWordId(null);
    }
  };

  const isDragMode = inputMode === "drag";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate/50 text-center">
          {isDragMode
            ? "Kéo từ tiếng Anh vào đúng ô nghĩa tiếng Việt"
            : "Chọn từ → Sau đó chọn ô để ghép"}
          · Đã nối đúng <span className="font-semibold">{correctCount}/{vocabList.length}</span>
        </p>

        {/* Input Mode Selector */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              setInputMode("drag");
              setSelectedWordId(null);
            }}
            className={[
              "px-4 py-2 rounded-full text-xs font-semibold transition-all",
              inputMode === "drag"
                ? "bg-pink-600 text-white shadow-md"
                : "bg-surface-soft text-slate/60 hover:bg-pink-100",
            ].join(" ")}
          >
            🖱 Kéo thả
          </button>
          <button
            onClick={() => {
              setInputMode("clickSelect");
              setSelectedWordId(null);
            }}
            className={[
              "px-4 py-2 rounded-full text-xs font-semibold transition-all",
              inputMode === "clickSelect"
                ? "bg-pink-600 text-white shadow-md"
                : "bg-surface-soft text-slate/60 hover:bg-pink-100",
            ].join(" ")}
          >
            👆 Click ghép
          </button>
        </div>
      </div>

      <DndContext sensors={isDragMode ? sensors : undefined} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {remainingWords.map((w) => (
              <DraggableWord
                key={w.id}
                id={w.id}
                label={w.word}
                isDragMode={isDragMode}
                isSelected={selectedWordId === w.id && !isDragMode}
                onSelectWord={handleSelectWord}
              />
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
                isDragMode={isDragMode}
                isHoverTarget={selectedWordId !== null && !isDragMode}
                onClickSlot={handleClickSlot}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {selectedWordId && !isDragMode && (
        <div className="bg-pink-100 border border-pink-300 rounded-xl px-4 py-2 text-sm text-slate flex items-center justify-between">
          <span>
            Đã chọn: <span className="font-semibold">{shuffledWords.find(w => w.id === selectedWordId)?.word}</span>
          </span>
          <button
            onClick={() => setSelectedWordId(null)}
            className="text-xs font-semibold text-pink-600 hover:text-pink-700 px-2 py-1 rounded hover:bg-pink-200 transition-colors"
          >
            Hủy
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="primary" fullWidth disabled={!allMatched} onClick={onNext}>
          {allMatched ? "Tiếp theo →" : "Nối đúng hết các cặp để tiếp tục"}
        </Button>
      </div>
    </div>
  );
}
