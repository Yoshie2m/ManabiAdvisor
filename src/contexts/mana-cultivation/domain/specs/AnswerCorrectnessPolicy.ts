export interface AnswerCorrectnessPolicy {
  isSatisfiedBy(submittedAnswer: string, correctAnswer: string): boolean;
}

// 前後の空白のみ許容し、完全一致で正誤判定する。
export const answerCorrectnessPolicy: AnswerCorrectnessPolicy = {
  isSatisfiedBy: (submittedAnswer, correctAnswer) => submittedAnswer.trim() === correctAnswer.trim(),
};
