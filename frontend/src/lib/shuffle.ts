export function fisherYatesShuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface McqOption {
  text: string;
}
export interface McqQuestion {
  id: string;
  question: string;
  options: McqOption[];
  correctIndex: number;
}

export function shuffleMcqQuestions(questions: McqQuestion[]): McqQuestion[] {
  const shuffled = fisherYatesShuffle(questions);
  return shuffled.map((q) => {
    const tagged = q.options.map((opt, idx) => ({ ...opt, __i: idx }));
    const shuffledOpts = fisherYatesShuffle(tagged);
    const newCorrect = shuffledOpts.findIndex((o) => o.__i === q.correctIndex);
    return {
      ...q,
      options: shuffledOpts.map(({ __i: _i, ...rest }) => rest),
      correctIndex: newCorrect,
    };
  });
}