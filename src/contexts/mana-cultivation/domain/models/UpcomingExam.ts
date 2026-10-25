import type { ExamType } from "./ExamType";

export type UpcomingExamProps = {
  id: string;
  title: string;
  examType: ExamType;
  scheduledDate: Date;
  targetLearningUnitIds: readonly string[];
};

// ある ExamType について予定されているテスト。範囲がまだ登録されていない予定も持てる（第21回ヒアリング）。
export class UpcomingExam {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly examType: ExamType,
    readonly scheduledDate: Date,
    readonly targetLearningUnitIds: readonly string[],
  ) {}

  static create({ id, title, examType, scheduledDate, targetLearningUnitIds }: UpcomingExamProps): UpcomingExam {
    if (title.trim().length === 0) {
      throw new Error("UpcomingExam.title must not be empty");
    }
    return new UpcomingExam(id, title, examType, scheduledDate, [...targetLearningUnitIds]);
  }
}
