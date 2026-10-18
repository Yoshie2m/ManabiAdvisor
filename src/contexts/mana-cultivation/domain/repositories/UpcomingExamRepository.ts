import type { ExamType } from "../models/ExamType";
import type { UpcomingExam } from "../models/UpcomingExam";

export interface UpcomingExamRepository {
  findByExamType(examType: ExamType): Promise<UpcomingExam | null>;
}
