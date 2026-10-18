import type { ExamType } from "./ExamType";

export class UpcomingExam {
  constructor(
    readonly id: string,
    readonly examType: ExamType,
    readonly scheduledDate: Date,
    readonly targetLearningUnitIds: readonly string[],
  ) {
    if (targetLearningUnitIds.length === 0) {
      throw new Error("UpcomingExam.targetLearningUnitIds must not be empty");
    }
  }
}
