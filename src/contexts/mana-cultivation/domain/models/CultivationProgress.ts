import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { LAUNCHED_GRADES } from "../specs/GradeExamTypePolicy";
import type { CharacterCard } from "./CharacterCard";
import type { Curriculum } from "./Curriculum";
import type { Grade } from "./Grade";
import type { LearningUnit } from "./LearningUnit";
import { ManaGel } from "./ManaGel";
import { SUBJECTS, type Subject } from "./Subject";
import { SubjectAbility } from "./SubjectAbility";
import { UnderstandingLevel } from "./UnderstandingLevel";

const LEARNING_UNIT_COMPLETION_GAIN = 5;

export class CultivationProgress {
  private readonly understandingLevels = new Map<string, UnderstandingLevel>();
  private readonly acquiredCardIds = new Set<string>();
  // 間違えたままの問題（問題ID→単元ID）。不正解で入り、1回正解すれば消える（第22回ヒアリング）。
  private readonly missedQuestions = new Map<string, string>();

  private constructor(
    readonly studentId: StudentId,
    private currentGrade: Grade,
    private readonly abilities: Map<Subject, SubjectAbility>,
    private readonly manaGels: Map<Subject, ManaGel>,
  ) {}

  get grade(): Grade {
    return this.currentGrade;
  }

  // 能力値・理解度・ジェル・獲得カードは学年をまたいで残す。
  changeGrade(grade: Grade): void {
    if (!LAUNCHED_GRADES.includes(grade)) {
      throw new Error(`Grade is not launched yet: ${grade}`);
    }
    this.currentGrade = grade;
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
    manaGels: ReadonlyMap<Subject, ManaGel>;
    acquiredCardIds: ReadonlySet<string>;
    missedQuestions: ReadonlyMap<string, string>;
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
    for (const cardId of params.acquiredCardIds) {
      progress.acquiredCardIds.add(cardId);
    }
    for (const [questionId, learningUnitId] of params.missedQuestions) {
      progress.missedQuestions.set(questionId, learningUnitId);
    }
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

  hasAcquiredCard(cardId: string): boolean {
    return this.acquiredCardIds.has(cardId);
  }

  getAcquiredCardIds(): ReadonlySet<string> {
    return this.acquiredCardIds;
  }

  // ジェルを使ってカードを獲得する。獲得済み・ジェル不足なら例外で、どちらの状態も変えない。
  exchangeForCard(card: CharacterCard): void {
    if (this.acquiredCardIds.has(card.id)) {
      throw new Error(`Card already acquired: ${card.id}`);
    }
    const remaining = this.getManaGel(card.cost.subject).spend(card.cost.count);
    this.manaGels.set(card.cost.subject, remaining);
    this.acquiredCardIds.add(card.id);
  }

  // 正解なら、理解度の記録に加えてその単元の科目の魔力ジェルを1個増やす。
  recordAttempt(
    curriculum: Curriculum,
    learningUnit: LearningUnit,
    questionId: string,
    isCorrect: boolean,
  ): UnderstandingLevel {
    if (learningUnit.curriculumId !== curriculum.id) {
      throw new Error("LearningUnit does not belong to the given Curriculum");
    }
    const next = this.getUnderstanding(learningUnit.id).recordAttempt(isCorrect);
    this.understandingLevels.set(learningUnit.id, next);
    if (isCorrect) {
      this.manaGels.set(curriculum.subject, this.getManaGel(curriculum.subject).add(1));
      this.missedQuestions.delete(questionId);
    } else {
      this.missedQuestions.set(questionId, learningUnit.id);
    }
    return next;
  }

  getMissedQuestionIds(learningUnitId: string): string[] {
    return [...this.missedQuestions]
      .filter(([, unitId]) => unitId === learningUnitId)
      .map(([questionId]) => questionId);
  }

  getMissedQuestions(): ReadonlyMap<string, string> {
    return this.missedQuestions;
  }
}
