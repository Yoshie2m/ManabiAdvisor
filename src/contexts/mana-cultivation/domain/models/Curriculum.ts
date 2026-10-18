import { curriculumSubjectSpecification } from "../specs/CurriculumSubjectSpecification";
import type { ExamType } from "./ExamType";
import type { Subject } from "./Subject";

export type CurriculumProps = {
  id: string;
  examType: ExamType;
  subject: Subject;
  title: string;
};

export class Curriculum {
  private constructor(
    readonly id: string,
    readonly examType: ExamType,
    readonly subject: Subject,
    readonly title: string,
  ) {}

  static create({ id, examType, subject, title }: CurriculumProps): Curriculum {
    if (!curriculumSubjectSpecification.isSatisfiedBy(examType, subject)) {
      throw new Error(`ExamType "${examType}" does not offer subject "${subject}"`);
    }
    return new Curriculum(id, examType, subject, title);
  }
}
