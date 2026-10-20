import { isDifficulty, type Difficulty } from "./Difficulty";
import type { QuestionType } from "./QuestionType";
import type { Subject } from "./Subject";
import { subjectQuestionTypePolicy } from "../specs/SubjectQuestionTypePolicy";

export type LearningUnitProps = {
  id: string;
  curriculumId: string;
  title: string;
  difficulty: Difficulty;
  questionType?: QuestionType;
  referenceText?: string;
  referenceAudioUrl?: string;
};

export class LearningUnit {
  private constructor(
    readonly id: string,
    readonly curriculumId: string,
    readonly title: string,
    readonly difficulty: Difficulty,
    readonly questionType: QuestionType | null,
    // 採点対象の問題ではない読み物・解説（本文・文法ポイント等）。単元に0〜1件、
    // Question件数とは独立に持てる（第14回ヒアリング参照）。
    readonly referenceText: string | null,
    // referenceTextの聞き取り用音声（会話文の英語セリフのみを読み上げたもの）のURL。
    // referenceTextと同様、0〜1件・Question件数とは独立（第15回ヒアリング参照）。
    readonly referenceAudioUrl: string | null,
  ) {}

  static create(
    { id, curriculumId, title, difficulty, questionType, referenceText, referenceAudioUrl }: LearningUnitProps,
    subject: Subject,
  ): LearningUnit {
    if (!isDifficulty(difficulty)) {
      throw new Error(`LearningUnit.difficulty must be one of 1-5, got ${difficulty}`);
    }
    if (questionType && !subjectQuestionTypePolicy.isSatisfiedBy(subject, questionType)) {
      throw new Error(`Subject "${subject}" does not support questionType "${questionType}"`);
    }
    return new LearningUnit(
      id,
      curriculumId,
      title,
      difficulty,
      questionType ?? null,
      referenceText ?? null,
      referenceAudioUrl ?? null,
    );
  }

  // Trusts persisted invariants instead of re-checking SubjectQuestionTypePolicy against a subject.
  static reconstruct({
    id,
    curriculumId,
    title,
    difficulty,
    questionType,
    referenceText,
    referenceAudioUrl,
  }: LearningUnitProps): LearningUnit {
    return new LearningUnit(
      id,
      curriculumId,
      title,
      difficulty,
      questionType ?? null,
      referenceText ?? null,
      referenceAudioUrl ?? null,
    );
  }
}
