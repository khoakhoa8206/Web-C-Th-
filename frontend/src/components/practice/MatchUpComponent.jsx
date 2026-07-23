import React, { useMemo, useState } from "react";
import { Button } from "../ui";
import { fisherYatesShuffle } from ".. ./utils/shuffle";

 *
 * Bài 2 — MatchUpComponent v3 (Click-Select Mode Only)
 * Trò chơi nối từ: nhấn chọn từ tiếng Anh → chọn ô nghĩa tiếng Việt → ghép
 * 
 * Changes v3:
 * 1. Xoá hoàn toàn drag-drop mode (@dnd-kit/core)
 * 2. Chỉ giữ click-select mode
 * 3. Khi ghép đúng: chuyển sang màu xanh lá (success) + pop-in animation
 * 4. Xoá nút chọn input mode
 */

function SelectableWord({ id, label, isSelected, onSelectWord }) {
  return (
    <button
      onClick={() => onSelectWord(id)}
      className={[
        "w-full text-left px-4 py-3 rounded-2xl border font-semibold text-sm",
        "bg-white border-pink-200 text-slate-900 shadow-sm touch-none select-none",
        "transition-all duration-200 cursor-pointer",
        isSelected
          ? "bg-pink-100 border-pink-500 ring-2 ring-pink-400"
          : "hover:bg-pink-50 hover:border-pink-300",
      ].join(" ")}
      aria-pressed={isSelected}
    >
      {label}
      {isSelected && <span className="ml-2 text-pink-600">✓</span>}
    </button>
  );
}

function MatchSlot({ id, label, matchedWord, isCorrect, onRemove, isHoverTarget, onClickSlot }) {
  const isMatched = Boolean(matchedWord);

  return (
    <div
      onClick={() => onClickSlot && onClickSlot(id)}
      className={[
        "px-4 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold min-h-[52px]",
        "flex items-center justify-between gap-2 transition-all duration-300 cursor-pointer",
        isMatched && isCorrect
          ? "bg-success-bg border-success text-success-text "
          : isMatched && !isCorrect
          ? "bg-danger-bg border-danger text-danger-text"
          : isHoverTarget
          ? "bg-pink-100 border-pink-400 ring-2 ring-pink-400"
          : "bg-gray-100 border-surface-border text-slate-900",
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
          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white hover:bg-white text-slate-900 hover:text-danger-text transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function MatchUpComponent({ vocabList, matchedPairs, onMatchChange, onNext }) {
  const [selectedWordId, setSelectedWordId] = useState(null);

    Trộn thứ tự cột trái/phải một lần khi vào bài
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

    ---- CLICK-SELECT MODE ----
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
        Gỡ ghép cũ của từ này (nếu có)
      delete nextPairs[selectedWordId];
        Gỡ ghép cũ của ô này (nếu có)
      Object.keys(nextPairs).forEach((existingWordId) => {
        if (nextPairs[existingWordId] === meaningId) {
          delete nextPairs[existingWordId];
        }
      });
        Ghép cặp mới
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

  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-900 text-center">
          Chọn từ → Sau đó chọn ô để ghép · Đã nối đúng <span className="font-semibold">{correctCount} vocabList.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {remainingWords.map((w) => (
            <SelectableWord
              key={w.id}
              id={w.id}
              label={w.word}
              isSelected={selectedWordId === w.id}
              onSelectWord={handleSelectWord}
             
          ))}
          {remainingWords.length === 0 && (
            <p className="text-center text-sm text-slate-900 py-4">Đã ghép hết từ! 🎉</p>
          )}
        </div>
        <div className="space-y-2">
          {shuffledMeanings.map((m) => (
            <MatchSlot
              key={m.id}
              id={m.id}
              label={m.meaning}
              matchedWord={meaningToWord[m.id]?.word}
              isCorrect={m.id === meaningToWord[m.id]?.id}
              onRemove={() => handleRemove(m.id)}
              isHoverTarget={selectedWordId !== null}
              onClickSlot={handleClickSlot}
             
          ))}
        </div>
      </div>

      {selectedWordId && (
        <div className="bg-pink-100 border border-pink-300 rounded-xl px-4 py-2 text-sm text-slate-900 flex items-center justify-between ">
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
