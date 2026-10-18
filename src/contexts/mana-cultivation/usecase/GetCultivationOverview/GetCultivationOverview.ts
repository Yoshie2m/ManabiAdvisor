import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { Difficulty } from "../../domain/models/Difficulty";
import type { ExamType } from "../../domain/models/ExamType";
import type { Grade } from "../../domain/models/Grade";
import type { Mission, MissionType } from "../../domain/models/Mission";
import type { QuestionType } from "../../domain/models/QuestionType";
import { SUBJECTS, type Subject } from "../../domain/models/Subject";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";
import { gradeExamTypePolicy } from "../../domain/specs/GradeExamTypePolicy";

export type SubjectAbilityView = {
  subject: Subject;
  level: number;
};

export type LearningUnitView = {
  id: string;
  title: string;
  curriculumId: string;
  subject: Subject;
  difficulty: Difficulty;
  questionType: QuestionType | null;
  understandingRate: number;
};

export type MissionView = {
  id: string;
  type: MissionType;
  targetLearningUnitIds: string[];
} | null;

export type UpcomingExamView = {
  id: string;
  examType: ExamType;
  scheduledDate: Date;
  targetLearningUnitIds: string[];
} | null;

export type CultivationOverview = {
  grade: Grade;
  abilities: SubjectAbilityView[];
  units: LearningUnitView[];
  dailyMission: MissionView;
  mockExamMission: MissionView;
  upcomingExam: UpcomingExamView;
};

function toMissionView(mission: Mission | null): MissionView {
  if (!mission) {
    return null;
  }
  return {
    id: mission.id,
    type: mission.type,
    targetLearningUnitIds: [...mission.targetLearningUnitIds],
  };
}

export class GetCultivationOverview {
  constructor(
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly learningUnitRepository: LearningUnitRepository,
    private readonly upcomingExamRepository: UpcomingExamRepository,
  ) {}

  async execute(studentId: StudentId): Promise<CultivationOverview> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }

    const examType = gradeExamTypePolicy.availableExamTypesFor(progress.grade)[0];
    const curricula = await this.curriculumRepository.findByExamType(examType);
    const subjectByCurriculumId = new Map(curricula.map((c) => [c.id, c.subject]));
    const unitLists = await Promise.all(
      curricula.map((curriculum) => this.learningUnitRepository.findByCurriculumId(curriculum.id)),
    );
    const units = unitLists.flat();

    const upcomingExam = await this.upcomingExamRepository.findByExamType(examType);

    return {
      grade: progress.grade,
      abilities: SUBJECTS.map((subject) => ({
        subject,
        level: progress.getAbility(subject).level,
      })),
      units: units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        curriculumId: unit.curriculumId,
        subject: subjectByCurriculumId.get(unit.curriculumId) as Subject,
        difficulty: unit.difficulty,
        questionType: unit.questionType,
        understandingRate: progress.getUnderstanding(unit.id).rate,
      })),
      dailyMission: toMissionView(progress.getCurrentDailyMission()),
      mockExamMission: toMissionView(progress.getMockExamMission()),
      upcomingExam: upcomingExam
        ? {
            id: upcomingExam.id,
            examType: upcomingExam.examType,
            scheduledDate: upcomingExam.scheduledDate,
            targetLearningUnitIds: [...upcomingExam.targetLearningUnitIds],
          }
        : null,
    };
  }
}
