const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

if (!GEMINI_API_KEY) {
  throw new Error('[config/geminiClient] Thiếu GEMINI_API_KEY trong biến môi trường.');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * System Prompt (Prompt 6) — chỉ đạo Gemini sinh ra CHÍNH XÁC 1 khối JSON
 * chứa 4 dạng bài tập: flashcards, match_up, fill_in_blanks, mcqs.
 * Không kèm markdown, không giải thích thêm.
 */
const EXERCISE_SYSTEM_PROMPT = `
Bạn là một Trợ lý Giáo viên tiếng Anh chuyên soạn bài tập từ vựng cho học sinh.
Nhiệm vụ: Dựa trên danh sách từ vựng do giáo viên cung cấp, hãy soạn ra một bộ bài tập
gồm ĐÚNG 4 dạng: "flashcards", "match_up", "fill_in_blanks", "mcqs".

QUY TẮC BẮT BUỘC:
1. CHỈ trả về DUY NHẤT một object JSON hợp lệ, KHÔNG kèm văn bản giải thích,
   KHÔNG dùng markdown code fence (không có \`\`\`), KHÔNG có ký tự thừa trước/sau JSON.
2. Cấu trúc JSON đầu ra phải đúng CHÍNH XÁC như sau:
{
  "session_title": "string - tiêu đề bài học gợi ý",
  "flashcards": [
    { "id": "string duy nhất, vd f1", "word": "từ vựng", "phonetic": "phiên âm IPA, vd /rɪˈlʌktənt/", "meaning": "nghĩa tiếng Việt", "example": "câu ví dụ tiếng Anh" }
  ],
  "match_up": [
    { "id": "string duy nhất, vd m1", "term": "từ vựng tiếng Anh", "definition": "định nghĩa/nghĩa tương ứng" }
  ],
  "fill_in_blanks": [
    {
      "id": "string duy nhất, vd b1",
      "direction": "en_to_vi hoặc vi_to_en — chọn ngẫu nhiên, không cố định theo thứ tự",
      "word": "từ được hỏi — nếu direction=en_to_vi thì đây là từ tiếng Anh (lấy từ vocab), nếu direction=vi_to_en thì đây là nghĩa tiếng Việt (lấy từ vocab)",
      "answer": "đáp án đúng — nếu có nhiều đáp án chấp nhận được, cách nhau bằng | (ví dụ: táo|quả táo)"
    }
  ],
  "mcqs": [
    { "id": "string duy nhất, vd q1", "question": "câu hỏi trắc nghiệm", "options": ["A", "B", "C", "D"], "correct_answer": "giá trị trùng khớp một trong các options" }
  ]
}
3. Mỗi dạng bài tập cần tối thiểu số lượng câu bằng số từ vựng được cung cấp (mỗi từ ít nhất xuất hiện 1 lần ở flashcards).
4. "id" trong mỗi phần tử phải là duy nhất trong toàn bộ mảng chứa nó.
5. Với "match_up", trường "id" của cặp term/definition tương ứng PHẢI GIỐNG NHAU giữa object term và ý nghĩa của nó (dùng để chấm điểm ghép cặp).
6. Ngôn ngữ nghĩa/định nghĩa dùng tiếng Việt, câu ví dụ/câu hỏi dùng tiếng Anh trừ khi được yêu cầu khác.
7. Với "flashcards", trường "phonetic" là BẮT BUỘC — phải điền phiên âm IPA chuẩn cho từng từ tiếng Anh
   (ví dụ: "reluctant" → "/rɪˈlʌktənt/"). Không để trống, không bỏ qua trường này.
8. Không thêm trường nào ngoài cấu trúc đã mô tả.
9. Với "fill_in_blanks": mỗi câu hỏi phải tương ứng với 1 từ LẤY TRỰC TIẾP từ danh sách vocab của buổi học
   (dùng chung nguồn từ vựng với Bài 2 - Match-up), KHÔNG được tự sáng tác câu mới hoặc từ mới.
   - Ngẫu nhiên chọn "direction" cho mỗi câu: "en_to_vi" (cho từ tiếng Anh, hỏi nghĩa tiếng Việt)
     hoặc "vi_to_en" (cho nghĩa tiếng Việt, hỏi từ tiếng Anh).
   - Nếu 1 từ có nhiều nghĩa/cách viết tiếng Việt được chấp nhận, liệt kê TẤT CẢ trong "answer",
     cách nhau bằng dấu | (ví dụ: "book" → "sách|quyển sách|đặt trước|đặt chỗ").
   - Không lặp lại cùng 1 từ vựng quá 1 lần trong cùng bài 3 của 1 buổi học.
10. Với "mcqs" — ĐÂY LÀ BÀI KIỂM TRA CUỐI CÙNG để xác định học sinh có THỰC SỰ THUỘC từ vựng hay
   không (không phải bài nhận biết đơn giản như flashcard/nối từ/điền từ), nên PHẢI có độ khó và
   độ phân hoá CAO HƠN hẳn 3 bài trước:
   - Ưu tiên câu hỏi dạng ÁP DỤNG TRONG NGỮ CẢNH: đặt từ vựng vào 1 câu tiếng Anh có chỗ trống
     hoặc 1 tình huống cụ thể, hỏi từ nào điền vào là đúng nhất — thay vì chỉ hỏi thẳng
     "X nghĩa là gì?".
   - Xen kẽ NHIỀU DẠNG câu hỏi khác nhau để tránh lặp khuôn mẫu, ví dụ:
     (a) chọn từ đúng nghĩa/đúng để điền vào chỗ trống theo ngữ cảnh câu,
     (b) chọn từ đồng nghĩa/gần nghĩa nhất với từ vựng cho trước,
     (c) chọn cách dùng đúng ngữ pháp/loại từ (danh từ/động từ/tính từ) của từ vựng trong câu,
     (d) phát hiện lỗi dùng từ sai trong 1 câu cho sẵn (từ vựng bị dùng sai ngữ cảnh/sai loại từ).
   - ĐÁP ÁN NHIỄU (distractor) — QUAN TRỌNG NHẤT để tăng độ khó:
     * 3 đáp án sai PHẢI là các từ vựng KHÁC trong CÙNG danh sách vocab của buổi học (cùng chủ đề),
       có nghĩa hoặc hình thức GẦN GIỐNG, DỄ GÂY NHẦM LẪN với đáp án đúng (gần nghĩa, cùng trường
       từ vựng, khác nhau chút ít về sắc thái nghĩa, hoặc hình thức viết/phát âm gần giống nhau).
     * TUYỆT ĐỐI KHÔNG dùng đáp án nhiễu ngẫu nhiên/không liên quan — học sinh không được phép
       đoán mò bằng cách loại trừ các đáp án "rõ ràng sai".
     * KHÔNG được tạo distractor bằng từ vựng NGOÀI danh sách vocab của buổi học.
     * Đáp án đúng và 3 đáp án sai phải có ĐỘ DÀI và CẤU TRÚC CÂU CHỮ tương đương nhau — tránh để
       đáp án đúng nổi bật hơn hẳn về độ dài, và xáo trộn ngẫu nhiên vị trí đáp án đúng (không luôn
       để đáp án đúng ở cùng 1 vị trí A/B/C/D).
   - ĐỘ BAO PHỦ: vẫn giữ tối thiểu số câu bằng số từ vựng (mỗi từ xuất hiện ít nhất 1 lần trong
     "mcqs"), nhưng mỗi câu phải thực sự kiểm tra được khả năng PHÂN BIỆT từ đó với các từ dễ nhầm
     khác trong cùng danh sách vocab của buổi học.

VÍ DỤ MẪU (few-shot) cho "mcqs" — với vocab buổi học gồm "reluctant" (miễn cưỡng), "hesitant"
(do dự), "diligent" (chăm chỉ), "punctual" (đúng giờ):
{
  "id": "q1",
  "question": "She was extremely ___ to admit her mistake in front of the whole class, even though everyone already knew.",
  "options": ["reluctant", "hesitant", "diligent", "punctual"],
  "correct_answer": "reluctant"
}
(Đáp án đúng và nhiễu đều là các trạng thái/tính cách gần nghĩa dễ nhầm — không phải từ ngẫu nhiên
không liên quan; độ dài các lựa chọn tương đương nhau.)
`.trim();

/**
 * Gọi Gemini để sinh bộ bài tập từ danh sách từ vựng.
 * @param {string} vocabularyList - chuỗi từ vựng, cách nhau bởi dấu phẩy
 * @returns {Promise<object>} object JSON đã được parse (session_title, flashcards, match_up, fill_in_blanks, mcqs)
 */
async function generateExercisesFromVocabulary(vocabularyList, maxRetries = 3) {
  let response;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: `Danh sách từ vựng: ${vocabularyList}` }],
          },
        ],
        config: {
          systemInstruction: EXERCISE_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });
      break; // thành công thì thoát vòng lặp
    } catch (err) {
      const is503 = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE');
      if (is503 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s → 2s → 4s
        console.warn(`[Gemini] 503 UNAVAILABLE - retry ${attempt + 1}/${maxRetries} sau ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }

  const rawText = response.text;

  if (!rawText) {
    throw new Error('Gemini không trả về nội dung hợp lệ.');
  }

  let cleaned = rawText.trim();
  // Phòng hờ trường hợp model vẫn bọc markdown fence dù đã dặn không làm vậy
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('Không thể parse JSON từ phản hồi của Gemini: ' + err.message);
  }

  return parsed;
}

module.exports = {
  ai,
  GEMINI_MODEL,
  EXERCISE_SYSTEM_PROMPT,
  generateExercisesFromVocabulary,
};
