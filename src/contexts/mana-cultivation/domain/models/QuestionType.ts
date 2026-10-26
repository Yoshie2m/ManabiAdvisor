// 出題形式。全科目で共通して使う値オブジェクト。他科目向けの形式を追加する場合は、
// この配列に追加したうえで SubjectQuestionTypePolicy の対応表も更新する。
export const QUESTION_TYPES = [
  "VocabularyTest", // 単語テスト（英語）
  "PassageTranslationToJapanese", // 本文の和訳（英語）
  "PassageTranslationToEnglish", // 英訳問題（英語）
  "Calculation", // 計算問題（数学）
  "WordProblem", // 文章題（数学）
  "KanjiWriting", // 漢字の書き（国語）
  "KanjiReading", // 漢字の読み（国語）
  "MultipleChoice", // 4択（社会・理科）
  "OneQuestionOneAnswer", // 一問一答（社会・理科）
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export function isQuestionType(value: string): value is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(value);
}
