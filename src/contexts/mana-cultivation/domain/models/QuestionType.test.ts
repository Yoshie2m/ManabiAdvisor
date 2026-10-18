import { describe, expect, it } from "vitest";

import { isQuestionType, QUESTION_TYPES } from "./QuestionType";

describe("QuestionType", () => {
  it("has the English and Math question types", () => {
    expect(QUESTION_TYPES).toEqual([
      "VocabularyTest",
      "PassageTranslationToJapanese",
      "PassageTranslationToEnglish",
      "Calculation",
      "WordProblem",
    ]);
  });

  it.each(QUESTION_TYPES)("isQuestionType returns true for %s", (questionType) => {
    expect(isQuestionType(questionType)).toBe(true);
  });

  it("isQuestionType returns false for an unknown value", () => {
    expect(isQuestionType("Essay")).toBe(false);
  });
});
