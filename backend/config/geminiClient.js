const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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
    { "id": "string duy nhất, vd f1", "word": "từ vựng", "meaning": "nghĩa tiếng Việt", "example": "câu ví dụ tiếng Anh" }
  ],
  "match_up": [
    { "id": "string duy nhất, vd m1", "term": "từ vựng tiếng Anh", "definition": "định nghĩa/nghĩa tương ứng" }
  ],
  "fill_in_blanks": [
    { "id": "string duy nhất, vd b1", "sentence": "câu có chỗ trống dùng ký hiệu ___", "answer": "đáp án đúng (1 từ/cụm từ)" }
  ],
  "mcqs": [
    { "id": "string duy nhất, vd q1", "question": "câu hỏi trắc nghiệm", "options": ["A", "B", "C", "D"], "correct_answer": "giá trị trùng khớp một trong các options" }
  ]
}
3. Mỗi dạng bài tập cần tối thiểu số lượng câu bằng số từ vựng được cung cấp (mỗi từ ít nhất xuất hiện 1 lần ở flashcards).
4. "id" trong mỗi phần tử phải là duy nhất trong toàn bộ mảng chứa nó.
5. Với "match_up", trường "id" của cặp term/definition tương ứng PHẢI GIỐNG NHAU giữa object term và ý nghĩa của nó (dùng để chấm điểm ghép cặp).
6. Ngôn ngữ nghĩa/định nghĩa dùng tiếng Việt, câu ví dụ/câu hỏi dùng tiếng Anh trừ khi được yêu cầu khác.
7. Không thêm trường nào ngoài cấu trúc đã mô tả.
`.trim();

/**
 * Gọi Gemini để sinh bộ bài tập từ danh sách từ vựng.
 * @param {string} vocabularyList - chuỗi từ vựng, cách nhau bởi dấu phẩy
 * @returns {Promise<object>} object JSON đã được parse (session_title, flashcards, match_up, fill_in_blanks, mcqs)
 */
async function generateExercisesFromVocabulary(vocabularyList) {
  const response = await ai.models.generateContent({
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
