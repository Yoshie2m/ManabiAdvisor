import type { ExamType } from "../models/ExamType";
import type { UpcomingExam } from "../models/UpcomingExam";

export interface UpcomingExamRepository {
  findAllByExamType(examType: ExamType): Promise<UpcomingExam[]>;
}
