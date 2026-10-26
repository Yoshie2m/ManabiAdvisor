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

  it("allows KanjiWriting and KanjiReading for Japanese", () => {
    for (const questionType of ["KanjiWriting", "KanjiReading"] as const) {
      expect(subjectQuestionTypePolicy.isSatisfiedBy("Japanese", questionType)).toBe(true);
    }
  });

  it("rejects Japanese question types for other subjects", () => {
    for (const subject of ["English", "Math", "Science", "SocialStudies"] as const) {
      expect(subjectQuestionTypePolicy.isSatisfiedBy(subject, "KanjiWriting")).toBe(false);
    }
  });

  it("allows MultipleChoice and OneQuestionOneAnswer for SocialStudies and Science", () => {
    for (const subject of ["SocialStudies", "Science"] as const) {
      for (const questionType of ["MultipleChoice", "OneQuestionOneAnswer"] as const) {
        expect(subjectQuestionTypePolicy.isSatisfiedBy(subject, questionType)).toBe(true);
      }
    }
  });

  it("rejects MultipleChoice and OneQuestionOneAnswer for the other subjects", () => {
    for (const subject of ["English", "Math", "Japanese"] as const) {
      for (const questionType of ["MultipleChoice", "OneQuestionOneAnswer"] as const) {
        expect(subjectQuestionTypePolicy.isSatisfiedBy(subject, questionType)).toBe(false);
      }
    }
  });
});
