import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { Grade } from "../../domain/models/Grade";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

export class ChangeGrade {
  constructor(private readonly cultivationProgressRepository: CultivationProgressRepository) {}

  async execute(studentId: StudentId, grade: Grade): Promise<CultivationProgress> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }

    progress.changeGrade(grade);
    await this.cultivationProgressRepository.save(progress);
    return progress;
  }
}
