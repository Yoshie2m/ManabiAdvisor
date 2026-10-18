import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { UnderstandingLevel } from "../../domain/models/UnderstandingLevel";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

export class RecordAttempt {
  constructor(private readonly cultivationProgressRepository: CultivationProgressRepository) {}

  async execute(studentId: StudentId, learningUnitId: string, isCorrect: boolean): Promise<UnderstandingLevel> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }

    const level = progress.recordAttempt(learningUnitId, isCorrect);
    await this.cultivationProgressRepository.save(progress);
    return level;
  }
}
