/**
 * Chuẩn hoá chuỗi để so sánh đáp án fill_in_blanks (không phân biệt hoa/thường, khoảng trắng thừa).
 */
function normalize(str) {
  return String(str ?? '').trim().toLowerCase();
}

/**
 * Chấm điểm 1 lượt làm bài dựa trên đáp án học sinh gửi lên và đáp án đúng lưu trong exercises.content
 *
 * @param {object} exerciseContent - { flashcards, match_up, fill_in_blanks, mcqs }
 * @param {object} studentAnswers - { match_up: [{id, matched_id}], fill_in_blanks: [{id, student_answer}], mcqs: [{id, student_answer}] }
 * @returns {{ accuracy: number, totalGraded: number, correctCount: number, details: Array }}
 */
function gradeAttempt(exerciseContent, studentAnswers) {
  const details = [];

  const matchUpBank = exerciseContent.match_up || [];
  const fillBank = exerciseContent.fill_in_blanks || [];
  const mcqBank = exerciseContent.mcqs || [];

  const ansMatchUp = studentAnswers.match_up || [];
  const ansFill = studentAnswers.fill_in_blanks || [];
  const ansMcq = studentAnswers.mcqs || [];

  // --- Chấm match_up: đúng khi matched_id === id (ghép đúng cặp term<->definition cùng id) ---
  matchUpBank.forEach((item) => {
    const studentAns = ansMatchUp.find((a) => a.id === item.id);
    const studentValue = studentAns ? studentAns.matched_id : null;
    const isCorrect = studentValue !== null && studentValue === item.id;

    details.push({
      type: 'match_up',
      id: item.id,
      term: item.term,
      student_answer: studentValue,
      correct_answer_id: item.id, // id của definition đúng (giống id của term)
      is_correct: isCorrect,
    });
  });

  // --- Chấm fill_in_blanks: so khớp chuỗi đã chuẩn hoá ---
  fillBank.forEach((item) => {
    const studentAns = ansFill.find((a) => a.id === item.id);
    const studentValue = studentAns ? studentAns.student_answer : null;
    const isCorrect = studentValue !== null && normalize(studentValue) === normalize(item.answer);

    details.push({
      type: 'fill_in_blanks',
      id: item.id,
      sentence: item.sentence,
      student_answer: studentValue,
      correct_answer: item.answer,
      is_correct: isCorrect,
    });
  });

  // --- Chấm mcqs: so khớp trực tiếp ---
  mcqBank.forEach((item) => {
    const studentAns = ansMcq.find((a) => a.id === item.id);
    const studentValue = studentAns ? studentAns.student_answer : null;
    const isCorrect = studentValue !== null && studentValue === item.correct_answer;

    details.push({
      type: 'mcqs',
      id: item.id,
      question: item.question,
      student_answer: studentValue,
      correct_answer: item.correct_answer,
      is_correct: isCorrect,
    });
  });

  const totalGraded = details.length;
  const correctCount = details.filter((d) => d.is_correct).length;
  const accuracy = totalGraded > 0 ? Number(((correctCount / totalGraded) * 100).toFixed(2)) : 0;

  return { accuracy, totalGraded, correctCount, details };
}

/**
 * Định dạng lại `details` trả về cho client tuỳ theo kết quả PASSED/FAILED.
 * - PASSED: trả về TOÀN BỘ câu (đúng lẫn sai) kèm đáp án đúng.
 * - FAILED: CHỈ trả về các câu SAI, và KHÔNG kèm đáp án đúng (correct_answer / correct_answer_id bị ẩn).
 */
function formatResultForClient(details, passed) {
  if (passed) {
    return details; // đã có đủ student_answer + correct_answer + is_correct
  }

  // Chưa đạt: trả mảng rỗng — không lộ câu nào đúng/sai, không lộ đáp án đúng.
  // Frontend chỉ hiển thị tổng điểm + nút LÀM LẠI.
  return [];
}

module.exports = { gradeAttempt, formatResultForClient, normalize };
