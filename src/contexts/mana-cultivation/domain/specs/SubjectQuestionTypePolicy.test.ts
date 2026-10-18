import { describe, expect, it } from "vitest";

import { subjectQuestionTypePolicy } from "./SubjectQuestionTypePolicy";

describe("subjectQuestionTypePolicy", () => {
  it("allows the three question types for English", () => {
    for (const questionType of [
      "VocabularyTest",
      "PassageTranslationToJapanese",
      "PassageTranslationToEnglish",
    ] as const) {
      expect(subjectQuestionTypePolicy.isSatisfiedBy("English", questionType)).toBe(true);
    }
  });

  it("rejects English question types for other subjects", () => {
    for (const subject of ["Math", "Japanese", "Science", "SocialStudies"] as const) {
      expect(subjectQuestionTypePolicy.isSatisfiedBy(subject, "VocabularyTest")).toBe(false);
    }
  });

  it("allows Calculation and WordProblem for Math", () => {
    for (const questionType of ["Calculation", "WordProblem"] as const) {
      expect(subjectQuestionTypePolicy.isSatisfiedBy("Math", questionType)).toBe(true);
    }
  });

  it("rejects Math question types for other subjects", () => {
    for (const subject of ["English", "Japanese", "Science", "SocialStudies"] as const) {
      expect(subjectQuestionTypePolicy.isSatisfiedBy(subject, "Calculation")).toBe(false);
    }
  });
});
