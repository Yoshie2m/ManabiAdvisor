import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { SubjectAbility } from "../../domain/models/SubjectAbility";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";

export class CompleteLearningUnit {
  constructor(
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly learningUnitRepository: LearningUnitRepository,
  ) {}

  async execute(studentId: StudentId, learningUnitId: string): Promise<SubjectAbility> {
    const learningUnit = await this.learningUnitRepository.findById(learningUnitId);
    if (!learningUnit) {
      throw new Error(`LearningUnit not found: ${learningUnitId}`);
    }
    const curriculum = await this.curriculumRepository.findById(learningUnit.curriculumId);
    if (!curriculum) {
      throw new Error(`Curriculum not found: ${learningUnit.curriculumId}`);
    }
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }

    const ability = progress.completeLearningUnit(curriculum, learningUnit);
    await this.cultivationProgressRepository.save(progress);
    return ability;
  }
}
