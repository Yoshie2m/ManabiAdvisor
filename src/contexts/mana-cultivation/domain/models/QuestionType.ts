// 出題形式。全科目で共通して使う値オブジェクトだが、現時点では英語向けの3種類のみ定義済み。
// 他科目向けの形式（数学の「計算問題」等）を追加する場合は、この配列に追加したうえで
// SubjectQuestionTypePolicy の対応表も更新する。
export const QUESTION_TYPES = [
  "VocabularyTest", // 単語テスト
  "PassageTranslationToJapanese", // 本文の和訳
  "PassageTranslationToEnglish", // 英訳問題
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export function isQuestionType(value: string): value is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(value);
}
