const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, coerceTypes: false });

// Schema mô tả cấu trúc dữ liệu bài tập dùng chung cho:
// - Body của PUT /api/teacher/update-exercises/:session_id
// - (Tuỳ chọn) validate lại output của Gemini trước khi lưu DB
const exerciseSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    session_title: { type: 'string', minLength: 1 },
    flashcards: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'word', 'meaning'],
        properties: {
          id: { type: 'string', minLength: 1 },
          word: { type: 'string', minLength: 1 },
          meaning: { type: 'string', minLength: 1 },
          example: { type: 'string' },
        },
      },
    },
    match_up: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'term', 'definition'],
        properties: {
          id: { type: 'string', minLength: 1 },
          term: { type: 'string', minLength: 1 },
          definition: { type: 'string', minLength: 1 },
        },
      },
    },
    fill_in_blanks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'answer'],
        properties: {
          id: { type: 'string', minLength: 1 },
          // Format từ Gemini: word + direction
          word: { type: 'string' },
          direction: { type: 'string', enum: ['en_to_vi', 'vi_to_en'] },
          // Format cũ (từ ManageSessionsPage): sentence
          sentence: { type: 'string' },
          answer: { type: 'string', minLength: 1 },
        },
      },
    },
    mcqs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'question', 'options', 'correct_answer'],
        properties: {
          id: { type: 'string', minLength: 1 },
          question: { type: 'string', minLength: 1 },
          options: {
            type: 'array',
            minItems: 2,
            items: { type: 'string', minLength: 1 },
          },
          correct_answer: { type: 'string', minLength: 1 },
        },
      },
    },
  },
};

const validateFn = ajv.compile(exerciseSchema);

/**
 * Middleware validate body của request chỉnh sửa bài tập.
 * Nếu sai schema -> trả lỗi 400 kèm chi tiết field lỗi.
 */
function validateExercisesBody(req, res, next) {
  const valid = validateFn(req.body);

  if (!valid) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu bài tập không hợp lệ.',
      errors: validateFn.errors.map((e) => ({
        field: e.instancePath || e.params?.missingProperty || '(root)',
        message: e.message,
      })),
    });
  }

  // Ràng buộc nghiệp vụ thêm: mỗi mcq.correct_answer phải nằm trong options
  const mcqErrors = [];
  (req.body.mcqs || []).forEach((mcq, idx) => {
    if (!mcq.options.includes(mcq.correct_answer)) {
      mcqErrors.push(`mcqs[${idx}] (id: ${mcq.id}): correct_answer phải trùng với một trong options`);
    }
  });

  if (mcqErrors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu câu hỏi trắc nghiệm (mcqs) không hợp lệ.',
      errors: mcqErrors,
    });
  }

  return next();
}

module.exports = { validateExercisesBody, exerciseSchema };
