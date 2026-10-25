import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import {
  lowestUnderstandingRateFirstPolicy,
  type FocusUnitSelectionPolicy,
} from "../specs/FocusUnitSelectionPolicy";
import { LAUNCHED_GRADES } from "../specs/GradeExamTypePolicy";
import type { Curriculum } from "./Curriculum";
import type { Grade } from "./Grade";
import type { LearningUnit } from "./LearningUnit";
import { ManaGel } from "./ManaGel";
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
    private currentGrade: Grade,
    private readonly abilities: Map<Subject, SubjectAbility>,
    private readonly manaGels: Map<Subject, ManaGel>,
  ) {}

  get grade(): Grade {
    return this.currentGrade;
  }

  // 能力値・単元ごとの理解度は学年をまたいで残す。ミッションは元の学年の試験範囲を指すため取り消す。
  changeGrade(grade: Grade): void {
    if (!LAUNCHED_GRADES.includes(grade)) {
      throw new Error(`Grade is not launched yet: ${grade}`);
    }
    if (grade === this.currentGrade) {
      return;
    }
    this.currentGrade = grade;
    this.currentDailyMission = null;
    this.currentMockExamMission = null;
  }

  static initiate(studentId: StudentId, grade: Grade): CultivationProgress {
    const abilities = new Map(SUBJECTS.map((subject) => [subject, SubjectAbility.initial(subject)]));
    const manaGels = new Map(SUBJECTS.map((subject) => [subject, ManaGel.none(subject)]));
    return new CultivationProgress(studentId, grade, abilities, manaGels);
  }

  // Trusts persisted invariants instead of re-deriving them; use `initiate` for a brand-new student.
  static reconstruct(params: {
    studentId: StudentId;
    grade: Grade;
    abilities: ReadonlyMap<Subject, SubjectAbility>;
    understandingLevels: ReadonlyMap<string, UnderstandingLevel>;
    currentDailyMission: Mission | null;
    currentMockExamMission: Mission | null;
    manaGels: ReadonlyMap<Subject, ManaGel>;
  }): CultivationProgress {
    const progress = new CultivationProgress(
      params.studentId,
      params.grade,
      new Map(params.abilities),
      new Map(params.manaGels),
    );
    for (const [learningUnitId, level] of params.understandingLevels) {
      progress.understandingLevels.set(learningUnitId, level);
    }
    progress.currentDailyMission = params.currentDailyMission;
    progress.currentMockExamMission = params.currentMockExamMission;
    return progress;
  }

  getUnderstandingLevels(): ReadonlyMap<string, UnderstandingLevel> {
    return this.understandingLevels;
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

  getManaGel(subject: Subject): ManaGel {
    const gel = this.manaGels.get(subject);
    if (!gel) {
      throw new Error(`Unknown subject: ${subject}`);
    }
    return gel;
  }

  // 正解なら、理解度の記録に加えてその単元の科目の魔力ジェルを1個増やす。
  recordAttempt(curriculum: Curriculum, learningUnit: LearningUnit, isCorrect: boolean): UnderstandingLevel {
    if (learningUnit.curriculumId !== curriculum.id) {
      throw new Error("LearningUnit does not belong to the given Curriculum");
    }
    const next = this.getUnderstanding(learningUnit.id).recordAttempt(isCorrect);
    this.understandingLevels.set(learningUnit.id, next);
    if (isCorrect) {
      this.manaGels.set(curriculum.subject, this.getManaGel(curriculum.subject).add(1));
    }
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
