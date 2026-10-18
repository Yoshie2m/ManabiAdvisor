export type QuestionProps = {
  id: string;
  learningUnitId: string;
  prompt: string;
  answer: string;
};

export class Question {
  private constructor(
    readonly id: string,
    readonly learningUnitId: string,
    readonly prompt: string,
    readonly answer: string,
  ) {}

  static create({ id, learningUnitId, prompt, answer }: QuestionProps): Question {
    if (prompt.trim().length === 0) {
      throw new Error("Question.prompt must not be empty");
    }
    if (answer.trim().length === 0) {
      throw new Error("Question.answer must not be empty");
    }
    return new Question(id, learningUnitId, prompt, answer);
  }

  // Trusts persisted invariants instead of re-checking for empty prompt/answer.
  static reconstruct({ id, learningUnitId, prompt, answer }: QuestionProps): Question {
    return new Question(id, learningUnitId, prompt, answer);
  }
}
