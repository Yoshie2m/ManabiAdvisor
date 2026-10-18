import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { Mission } from "../../domain/models/Mission";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";
import { gradeExamTypePolicy } from "../../domain/specs/GradeExamTypePolicy";

export class GenerateDailyMission {
  constructor(
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly upcomingExamRepository: UpcomingExamRepository,
  ) {}

  async execute(studentId: StudentId, missionId: string): Promise<Mission> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }

    const [examType] = gradeExamTypePolicy.availableExamTypesFor(progress.grade);
    const upcomingExam = await this.upcomingExamRepository.findByExamType(examType);
    if (!upcomingExam) {
      throw new Error(`No upcoming exam found for examType: ${examType}`);
    }

    const mission = progress.assignDailyMission(upcomingExam, missionId);
    await this.cultivationProgressRepository.save(progress);
    return mission;
  }
}
