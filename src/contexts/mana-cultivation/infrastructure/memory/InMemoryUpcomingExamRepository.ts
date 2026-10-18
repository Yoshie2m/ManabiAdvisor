import type { ExamType } from "../../domain/models/ExamType";
import type { UpcomingExam } from "../../domain/models/UpcomingExam";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";

// 動作確認用のインメモリ実装。DB連携時はFirebase実装に差し替える。
export class InMemoryUpcomingExamRepository implements UpcomingExamRepository {
  constructor(private readonly exams: readonly UpcomingExam[]) {}

  async findByExamType(examType: ExamType): Promise<UpcomingExam | null> {
    return this.exams.find((exam) => exam.examType === examType) ?? null;
  }
}
