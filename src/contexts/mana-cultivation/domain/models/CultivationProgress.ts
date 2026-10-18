import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import {
  lowestUnderstandingRateFirstPolicy,
  type FocusUnitSelectionPolicy,
} from "../specs/FocusUnitSelectionPolicy";
import type { Curriculum } from "./Curriculum";
import type { Grade } from "./Grade";
import type { LearningUnit } from "./LearningUnit";
import { Mission } from "./Mission";
import { SUBJECTS, type Subject } from "./Subject";
import { SubjectAbility } from "./SubjectAbility";
import { UnderstandingLevel } from "./UnderstandingLevel";
import type { UpcomingExam } from "./UpcomingExam";

const LEARNING_UNIT_COMPLETION_GAIN = 5;

export class CultivationProgress {
  private readonly understandingLevels = new Map<string, UnderstandingLevel>();
  private currentDailyMission: Mission | null = null;
  private currentMockExamMission: Mission | null = null;

  private constructor(
    readonly studentId: StudentId,
    readonly grade: Grade,
    private readonly abilities: Map<Subject, SubjectAbility>,
  ) {}

  static initiate(studentId: StudentId, grade: Grade): CultivationProgress {
    const abilities = new Map(SUBJECTS.map((subject) => [subject, SubjectAbility.initial(subject)]));
    return new CultivationProgress(studentId, grade, abilities);
  }

  getAbility(subject: Subject): SubjectAbility {
    const ability = this.abilities.get(subject);
    if (!ability) {
      throw new Error(`Unknown subject: ${subject}`);
    }
    return ability;
  }

  completeLearningUnit(curriculum: Curriculum, learningUnit: LearningUnit): SubjectAbility {
    if (learningUnit.curriculumId !== curriculum.id) {
      throw new Error("LearningUnit does not belong to the given Curriculum");
    }
    const next = this.getAbility(curriculum.subject).increase(LEARNING_UNIT_COMPLETION_GAIN);
    this.abilities.set(curriculum.subject, next);
    return next;
  }

  getUnderstanding(learningUnitId: string): UnderstandingLevel {
    return this.understandingLevels.get(learningUnitId) ?? UnderstandingLevel.zero(learningUnitId);
  }

  recordAttempt(learningUnitId: string, isCorrect: boolean): UnderstandingLevel {
    const next = this.getUnderstanding(learningUnitId).recordAttempt(isCorrect);
    this.understandingLevels.set(learningUnitId, next);
    return next;
  }

  getCurrentDailyMission(): Mission | null {
    return this.currentDailyMission;
  }

  assignDailyMission(
    upcomingExam: UpcomingExam,
    missionId: string,
    policy: FocusUnitSelectionPolicy = lowestUnderstandingRateFirstPolicy,
  ): Mission {
    const understandingLevels = upcomingExam.targetLearningUnitIds.map((id) => this.getUnderstanding(id));
    const focusUnitId = policy.selectFocusUnit(upcomingExam.targetLearningUnitIds, understandingLevels);
    const mission = Mission.assignDaily(missionId, focusUnitId);
    this.currentDailyMission = mission;
    return mission;
  }

  getMockExamMission(): Mission | null {
    return this.currentMockExamMission;
  }

  offerMockExamMission(upcomingExam: UpcomingExam, missionId: string): Mission {
    const mission = Mission.offerMockExam(missionId, upcomingExam);
    this.currentMockExamMission = mission;
    return mission;
  }
}
