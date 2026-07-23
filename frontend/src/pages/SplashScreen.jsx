import React, { useEffect, useState } from "react";

const QUOTES = [
  { en: "The more that you read, the more things you will know.", vi: "Bạn đọc càng nhiều, bạn sẽ biết càng nhiều." },
  { en: "An investment in knowledge pays the best interest.", vi: "Đầu tư vào kiến thức mang lại lợi nhuận tốt nhất." },
  { en: "The secret of getting ahead is getting started.", vi: "Bí quyết để tiến lên là hãy bắt đầu." },
  { en: "Every expert was once a beginner.", vi: "Mọi chuyên gia đều từng là người mới bắt đầu." },
  { en: "Don't watch the clock; do what it does. Keep going.", vi: "Đừng nhìn đồng hồ — hãy làm như nó. Tiếp tục tiến lên." },
  { en: "Learning is a treasure that will follow its owner everywhere.", vi: "Kiến thức là kho báu sẽ đồng hành cùng bạn mọi nơi." },
  { en: "The beautiful thing about learning is nobody can take it away from you.", vi: "Điều tuyệt vời của việc học là không ai có thể lấy đi của bạn." },
  { en: "A little progress each day adds up to big results.", vi: "Mỗi ngày tiến một chút, kết quả lớn sẽ đến." },
  { en: "Do something today that your future self will thank you for.", vi: "Hôm nay hãy làm điều gì đó để tương lai bạn cảm ơn bạn." },
  { en: "It always seems impossible until it's done.", vi: "Mọi thứ đều có vẻ không thể, cho đến khi nó được hoàn thành." },
  { en: "The only way to do great work is to love what you do.", vi: "Cách duy nhất để làm tốt là yêu thích điều bạn đang làm." },
  { en: "Believe you can and you're halfway there.", vi: "Tin bạn có thể làm được — bạn đã đi được một nửa đường rồi." },
  { en: "Success is the sum of small efforts repeated day in and day out.", vi: "Thành công là tổng hợp của những nỗ lực nhỏ được lặp đi lặp lại mỗi ngày." },
  { en: "The harder you work for something, the greater you'll feel when you achieve it.", vi: "Bạn cố gắng càng nhiều, cảm giác đạt được sẽ càng xứng đáng." },
  { en: "Don't stop when you're tired. Stop when you're done.", vi: "Đừng dừng khi bạn mệt. Hãy dừng khi bạn đã xong." },
  { en: "Push yourself, because no one else is going to do it for you.", vi: "Hãy thúc đẩy bản thân, vì không ai làm điều đó thay bạn được." },
  { en: "Great things never come from comfort zones.", vi: "Những điều vĩ đại không bao giờ đến từ vùng an toàn." },
  { en: "Dream it. Wish it. Do it.", vi: "Mơ về nó. Ước về nó. Làm ngay thôi!" },
  { en: "Strive for progress, not perfection.", vi: "Hãy cố gắng để tiến bộ, không phải để hoàn hảo." },
  { en: "Wake up with determination. Go to bed with satisfaction.", vi: "Thức dậy với quyết tâm. Đi ngủ với sự thỏa mãn." },
];

export default function SplashScreen({ hasError, onRetry }) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center gap-8 p-6">
      <p className="text-5xl">🌸</p>

      {!hasError ? (
        <>
          {/* Loading dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-pink-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          {/* Motivation quote */}
          <div className="max-w-sm text-center bg-white rounded-2xl border border-pink-100 shadow-sm px-6 py-5">
            <p className="text-base font-bold text-slate leading-relaxed mb-2">
              "{quote.en}"
            </p>
            <p className="text-sm text-slate/70 italic">
              {quote.vi}
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate">Không thể kết nối tới server</p>
          <p className="text-xs text-slate/70">Kiểm tra kết nối mạng hoặc thử lại sau.</p>
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
