import type { Curriculum } from "../models/Curriculum";
import type { ExamType } from "../models/ExamType";

export interface CurriculumRepository {
  findByExamType(examType: ExamType): Promise<Curriculum[]>;
  findById(id: string): Promise<Curriculum | null>;
}
