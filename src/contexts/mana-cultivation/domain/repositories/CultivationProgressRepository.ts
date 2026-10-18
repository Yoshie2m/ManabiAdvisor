import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { CultivationProgress } from "../models/CultivationProgress";

export interface CultivationProgressRepository {
  findByStudentId(studentId: StudentId): Promise<CultivationProgress | null>;
  save(progress: CultivationProgress): Promise<void>;
}
