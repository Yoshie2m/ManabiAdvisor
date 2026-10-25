import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { UnderstandingLevel } from "../../domain/models/UnderstandingLevel";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";

export class RecordAttempt {
  constructor(
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly learningUnitRepository: LearningUnitRepository,
    private readonly curriculumRepository: CurriculumRepository,
  ) {}

  async execute(studentId: StudentId, learningUnitId: string, isCorrect: boolean): Promise<UnderstandingLevel> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }

    const learningUnit = await this.learningUnitRepository.findById(learningUnitId);
    if (!learningUnit) {
      throw new Error(`LearningUnit not found: ${learningUnitId}`);
    }
    const curriculum = await this.curriculumRepository.findById(learningUnit.curriculumId);
    if (!curriculum) {
      throw new Error(`Curriculum not found: ${learningUnit.curriculumId}`);
    }

    const level = progress.recordAttempt(curriculum, learningUnit, isCorrect);
    await this.cultivationProgressRepository.save(progress);
    return level;
  }
}
