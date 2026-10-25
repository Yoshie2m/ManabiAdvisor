import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { Difficulty } from "../../domain/models/Difficulty";
import type { Grade } from "../../domain/models/Grade";
import type { QuestionType } from "../../domain/models/QuestionType";
import { SUBJECTS, type Subject } from "../../domain/models/Subject";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";
import { examReadinessPolicy } from "../../domain/specs/ExamReadinessPolicy";
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
  referenceText: string | null;
  referenceAudioUrl: string | null;
  understandingRate: number;
  attemptCount: number;
};

// 予定されたテスト1件の目標カード用の情報（第21回ヒアリング）。
export type ExamGoalView = {
  id: string;
  title: string;
  scheduledDate: Date;
  readiness: number;
  focusUnitId: string | null;
  focusUnitTitle: string | null;
};

export type ManaGelView = { subject: Subject; count: number };

export type CultivationOverview = {
  grade: Grade;
  abilities: SubjectAbilityView[];
  manaGels: ManaGelView[];
  units: LearningUnitView[];
  examGoals: ExamGoalView[];
};

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

    const exams = await this.upcomingExamRepository.findAllByExamType(examType);
    const unitTitleById = new Map(units.map((unit) => [unit.id, unit.title]));
    const examGoals = [...exams]
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
      .map((exam) => {
        const levels = exam.targetLearningUnitIds.map((id) => progress.getUnderstanding(id));
        const { readiness, focusUnitId } = examReadinessPolicy.assess(exam.targetLearningUnitIds, levels);
        return {
          id: exam.id,
          title: exam.title,
          scheduledDate: exam.scheduledDate,
          readiness,
          focusUnitId,
          focusUnitTitle: focusUnitId ? (unitTitleById.get(focusUnitId) ?? null) : null,
        };
      });

    return {
      grade: progress.grade,
      manaGels: SUBJECTS.map((subject) => ({
        subject,
        count: progress.getManaGel(subject).count,
      })),
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
        referenceText: unit.referenceText,
        referenceAudioUrl: unit.referenceAudioUrl,
        understandingRate: progress.getUnderstanding(unit.id).rate,
        attemptCount: progress.getUnderstanding(unit.id).totalCount,
      })),
      examGoals,
    };
  }
}
