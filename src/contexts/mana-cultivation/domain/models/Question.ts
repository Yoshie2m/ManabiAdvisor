export type QuestionProps = {
  id: string;
  learningUnitId: string;
  prompt: string;
  answer: string;
  // 省略可。正解に添える解説・考え方。採点には使わない表示用テキスト。
  explanation?: string;
  // 省略可。問題に添える図・写真のURL。
  imageUrl?: string;
};

export class Question {
  private constructor(
    readonly id: string,
    readonly learningUnitId: string,
    readonly prompt: string,
    readonly answer: string,
    readonly explanation: string | null,
    readonly imageUrl: string | null,
  ) {}

  static create({ id, learningUnitId, prompt, answer, explanation, imageUrl }: QuestionProps): Question {
    if (prompt.trim().length === 0) {
      throw new Error("Question.prompt must not be empty");
    }
    if (answer.trim().length === 0) {
      throw new Error("Question.answer must not be empty");
    }
    return new Question(id, learningUnitId, prompt, answer, explanation ?? null, imageUrl ?? null);
  }

  // Trusts persisted invariants instead of re-checking for empty prompt/answer.
  static reconstruct({ id, learningUnitId, prompt, answer, explanation, imageUrl }: QuestionProps): Question {
    return new Question(id, learningUnitId, prompt, answer, explanation ?? null, imageUrl ?? null);
  }
}
