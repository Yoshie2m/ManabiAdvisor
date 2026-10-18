import { describe, expect, it } from "vitest";

import { isQuestionType, QUESTION_TYPES } from "./QuestionType";

describe("QuestionType", () => {
  it("has the three English question types", () => {
    expect(QUESTION_TYPES).toEqual([
      "VocabularyTest",
      "PassageTranslationToJapanese",
      "PassageTranslationToEnglish",
    ]);
  });

  it.each(QUESTION_TYPES)("isQuestionType returns true for %s", (questionType) => {
    expect(isQuestionType(questionType)).toBe(true);
  });

  it("isQuestionType returns false for an unknown value", () => {
    expect(isQuestionType("Calculation")).toBe(false);
  });
});
