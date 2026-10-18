import type { LearningUnit } from "../models/LearningUnit";

export interface LearningUnitRepository {
  findById(id: string): Promise<LearningUnit | null>;
  findByCurriculumId(curriculumId: string): Promise<LearningUnit[]>;
}
