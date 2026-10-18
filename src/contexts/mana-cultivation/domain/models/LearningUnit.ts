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
};

export class LearningUnit {
  private constructor(
    readonly id: string,
    readonly curriculumId: string,
    readonly title: string,
    readonly difficulty: Difficulty,
    readonly questionType: QuestionType | null,
  ) {}

  static create(
    { id, curriculumId, title, difficulty, questionType }: LearningUnitProps,
    subject: Subject,
  ): LearningUnit {
    if (!isDifficulty(difficulty)) {
      throw new Error(`LearningUnit.difficulty must be one of 1-5, got ${difficulty}`);
    }
    if (questionType && !subjectQuestionTypePolicy.isSatisfiedBy(subject, questionType)) {
      throw new Error(`Subject "${subject}" does not support questionType "${questionType}"`);
    }
    return new LearningUnit(id, curriculumId, title, difficulty, questionType ?? null);
  }

  // Trusts persisted invariants instead of re-checking SubjectQuestionTypePolicy against a subject.
  static reconstruct({ id, curriculumId, title, difficulty, questionType }: LearningUnitProps): LearningUnit {
    return new LearningUnit(id, curriculumId, title, difficulty, questionType ?? null);
  }
}
