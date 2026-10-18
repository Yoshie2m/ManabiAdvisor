import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { Grade } from "../../domain/models/Grade";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

export class StartCultivation {
  constructor(private readonly cultivationProgressRepository: CultivationProgressRepository) {}

  async execute(studentId: StudentId, grade: Grade): Promise<CultivationProgress> {
    const progress = CultivationProgress.initiate(studentId, grade);
    await this.cultivationProgressRepository.save(progress);
    return progress;
  }
}
