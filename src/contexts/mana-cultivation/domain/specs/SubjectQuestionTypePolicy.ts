import type { QuestionType } from "../models/QuestionType";
import type { Subject } from "../models/Subject";

export interface SubjectQuestionTypePolicy {
  isSatisfiedBy(subject: Subject, questionType: QuestionType): boolean;
}

// 科目ごとに対応する出題形式。現時点では英語の3形式のみ定義済み。他科目に出題形式を
// 追加する場合は、ここに対応表を足す（例: Math: ["Calculation", "WordProblem"]）。
const QUESTION_TYPES_BY_SUBJECT: Partial<Record<Subject, readonly QuestionType[]>> = {
  English: ["VocabularyTest", "PassageTranslationToJapanese", "PassageTranslationToEnglish"],
};

export const subjectQuestionTypePolicy: SubjectQuestionTypePolicy = {
  isSatisfiedBy: (subject, questionType) =>
    (QUESTION_TYPES_BY_SUBJECT[subject] ?? []).includes(questionType),
};
