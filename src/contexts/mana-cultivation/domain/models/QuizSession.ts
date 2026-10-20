import type { StudentId } from "../../../house-assignment/domain/models/StudentId";

export type QuizSessionProps = {
  studentId: StudentId;
  learningUnitId: string;
  totalQuestions: number;
  currentIndex: number;
};

export class QuizSession {
  private constructor(
    readonly studentId: StudentId,
    readonly learningUnitId: string,
    readonly totalQuestions: number,
    private _currentIndex: number,
  ) {}

  static start(studentId: StudentId, learningUnitId: string, totalQuestions: number): QuizSession {
    if (totalQuestions <= 0) {
      throw new Error("QuizSession.totalQuestions must be positive");
    }
    return new QuizSession(studentId, learningUnitId, totalQuestions, 0);
  }

  // Trusts persisted invariants instead of re-validating totalQuestions/currentIndex.
  static reconstruct({ studentId, learningUnitId, totalQuestions, currentIndex }: QuizSessionProps): QuizSession {
    return new QuizSession(studentId, learningUnitId, totalQuestions, currentIndex);
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  get isComplete(): boolean {
    return this._currentIndex >= this.totalQuestions;
  }

  get progressRatio(): number {
    return this._currentIndex / this.totalQuestions;
  }

  advance(): void {
    if (this.isComplete) {
      throw new Error("QuizSession is already complete");
    }
    this._currentIndex += 1;
  }
}
