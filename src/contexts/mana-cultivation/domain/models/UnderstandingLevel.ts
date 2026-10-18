export class UnderstandingLevel {
  private constructor(
    readonly learningUnitId: string,
    readonly correctCount: number,
    readonly totalCount: number,
  ) {}

  static zero(learningUnitId: string): UnderstandingLevel {
    return new UnderstandingLevel(learningUnitId, 0, 0);
  }

  static create(learningUnitId: string, correctCount: number, totalCount: number): UnderstandingLevel {
    if (correctCount < 0 || totalCount < 0 || correctCount > totalCount) {
      throw new Error("UnderstandingLevel: correctCount must be between 0 and totalCount");
    }
    return new UnderstandingLevel(learningUnitId, correctCount, totalCount);
  }

  get rate(): number {
    if (this.totalCount === 0) {
      return 0;
    }
    return Math.round((this.correctCount / this.totalCount) * 100);
  }

  recordAttempt(isCorrect: boolean): UnderstandingLevel {
    return UnderstandingLevel.create(
      this.learningUnitId,
      this.correctCount + (isCorrect ? 1 : 0),
      this.totalCount + 1,
    );
  }
}
