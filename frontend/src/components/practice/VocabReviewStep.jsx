import React from "react";
import { Button } from "../ui";

/**
 * VocabReviewStep — bảng từ vựng ôn lại trước khi làm bài.
 * Props: { vocabList, onReady, stepError }
 * vocabList: [{ id, word, meaning, phonetic (= "Ví dụ: ...") }]
 */
export default function VocabReviewStep({ vocabList, onReady, stepError }) {
  return (
    <div className="min-h-screen bg-pink-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">📚</p>
          <h1 className="text-lg font-bold text-slate">Ôn lại từ vựng trước khi làm bài</h1>
          <p className="text-sm text-slate-600 mt-1">
            {vocabList.length} từ vựng · Học kỹ trước khi bấm Sẵn sàng
          </p>
        </div>

        {stepError && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-4 py-2 mb-4 text-center">
            {stepError}
          </p>
        )}

        <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
          <div className="grid grid-cols-3 gap-0 border-b border-surface-border bg-pink-50 px-4 py-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Từ vựng</p>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nghĩa</p>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ví dụ</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-surface-border">
            {vocabList.map((item, idx) => (
              <div
                key={item.id}
                className={`grid grid-cols-3 gap-0 px-4 py-3 ${idx % 2 === 1 ? "bg-pink-50/30" : ""}`}
              >
                <p className="text-sm font-bold text-slate pr-2">{item.word}</p>
                <p className="text-sm text-slate-800 pr-2">{item.meaning}</p>
                <p className="text-sm text-slate-600 italic">
                  {item.phonetic?.replace(/^Ví dụ:\s*/i, "") || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nút cố định góc dưới-phải */}
      <div className="fixed bottom-6 right-6">
        <Button variant="primary" onClick={onReady} className="shadow-lg">
          SẴN SÀNG LÀM BÀI →
        </Button>
      </div>
    </div>
  );
}
