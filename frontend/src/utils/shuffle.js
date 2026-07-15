/**
 * Fisher-Yates Shuffle — trộn ngẫu nhiên mảng, không làm thay đổi mảng gốc.
 * Dùng để: (1) trộn thứ tự câu hỏi MCQ, (2) trộn thứ tự đáp án A/B/C/D.
 */
export function fisherYatesShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Trộn toàn bộ danh sách câu hỏi MCQ: đảo thứ tự câu hỏi + đảo thứ tự đáp án
 * trong từng câu, đồng thời cập nhật lại index đáp án đúng theo vị trí mới.
 */
export function shuffleMcqQuestions(questions) {
  const shuffledQuestions = fisherYatesShuffle(questions);
  return shuffledQuestions.map((q) => {
    const options = q.options.map((opt, idx) => ({ ...opt, __origIndex: idx }));
    const shuffledOptions = fisherYatesShuffle(options);
    const newCorrectIndex = shuffledOptions.findIndex(
      (opt) => opt.__origIndex === q.correctIndex
    );
    return {
      ...q,
      options: shuffledOptions.map(({ __origIndex, ...rest }) => rest),
      correctIndex: newCorrectIndex,
    };
  });
}
