import { useMemo, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Button } from "@/components/vocab-ui";
import { fisherYatesShuffle } from "@/lib/shuffle";
import { cn } from "@/lib/utils";

export interface MatchUpItem {
  id: string;
  word: string;
  meaning: string;
}

function DraggableWord({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
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
      className={cn(
        "w-full text-left px-4 py-3 rounded-2xl border font-semibold text-sm",
        "bg-white border-pink-200 text-slate shadow-sm touch-none select-none transition-transform",
        isDragging
          ? "opacity-70 scale-105 shadow-card-hover"
          : "hover:border-pink-400",
      )}
    >
      {label}
    </button>
  );
}

function DroppableSlot({
  id,
  label,
  matchedWord,
  isCorrect,
  onRemove,
}: {
  id: string;
  label: string;
  matchedWord?: string;
  isCorrect: boolean;
  onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isMatched = Boolean(matchedWord);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "px-4 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold min-h-[52px]",
        "flex items-center justify-between gap-2 transition-colors duration-200",
        isMatched && isCorrect && "bg-pink-50 border-pink-300 text-slate",
        isMatched && !isCorrect && "bg-danger-bg border-danger-text/40 text-danger-text",
        !isMatched && isOver && "bg-pink-100 border-pink-400 text-pink-600",
        !isMatched && !isOver && "bg-surface-soft border-surface-border text-slate/50",
        isMatched && isOver && "ring-2 ring-pink-400",
      )}
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

export interface MatchUpComponentProps {
  vocabList: MatchUpItem[];
  matchedPairs: Record<string, string>;
  onMatchChange: (next: Record<string, string>) => void;
  onNext: () => void;
}

export function MatchUpComponent({
  vocabList,
  matchedPairs,
  onMatchChange,
  onNext,
}: MatchUpComponentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );
  const [shuffledWords] = useState(() => fisherYatesShuffle(vocabList));
  const [shuffledMeanings] = useState(() => fisherYatesShuffle(vocabList));

  const matchedIds = Object.keys(matchedPairs);
  const remainingWords = shuffledWords.filter((w) => !matchedIds.includes(w.id));
  const correctCount = Object.entries(matchedPairs).filter(
    ([w, m]) => w === m,
  ).length;
  const allMatched =
    matchedIds.length === vocabList.length &&
    correctCount === vocabList.length;

  const meaningToWord = useMemo(() => {
    const map: Record<string, MatchUpItem | undefined> = {};
    Object.entries(matchedPairs).forEach(([wordId, meaningId]) => {
      map[meaningId] = vocabList.find((v) => v.id === wordId);
    });
    return map;
  }, [matchedPairs, vocabList]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const wordId = String(active.id);
    const meaningId = String(over.id);
    const next = { ...matchedPairs };
    Object.keys(next).forEach((existingWordId) => {
      if (next[existingWordId] === meaningId && existingWordId !== wordId) {
        delete next[existingWordId];
      }
    });
    delete next[wordId];
    next[wordId] = meaningId;
    onMatchChange(next);
  };

  const handleRemove = (meaningId: string) => {
    const next = { ...matchedPairs };
    Object.keys(next).forEach((wordId) => {
      if (next[wordId] === meaningId) delete next[wordId];
    });
    onMatchChange(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate/50 text-center">
        Kéo từ tiếng Anh vào đúng ô nghĩa tiếng Việt · Đã nối đúng {correctCount}/
        {vocabList.length}
      </p>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {remainingWords.map((w) => (
              <DraggableWord key={w.id} id={w.id} label={w.word} />
            ))}
            {remainingWords.length === 0 && (
              <p className="text-center text-xs text-slate/30 py-4">
                Đã kéo hết từ! 🎉
              </p>
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