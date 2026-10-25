import type { QuestionType } from "../models/QuestionType";
import type { Subject } from "../models/Subject";

export interface SubjectQuestionTypePolicy {
  isSatisfiedBy(subject: Subject, questionType: QuestionType): boolean;
}

// 科目ごとに対応する出題形式。他科目に出題形式を追加する場合は、ここに対応表を足す。
const QUESTION_TYPES_BY_SUBJECT: Partial<Record<Subject, readonly QuestionType[]>> = {
  English: ["VocabularyTest", "PassageTranslationToJapanese", "PassageTranslationToEnglish"],
  Math: ["Calculation", "WordProblem"],
  Japanese: ["KanjiWriting", "KanjiReading"],
  SocialStudies: ["MultipleChoice", "OneQuestionOneAnswer"],
};

export const subjectQuestionTypePolicy: SubjectQuestionTypePolicy = {
  isSatisfiedBy: (subject, questionType) =>
    (QUESTION_TYPES_BY_SUBJECT[subject] ?? []).includes(questionType),
};
