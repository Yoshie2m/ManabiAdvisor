import { describe, expect, it } from "vitest";

import { LearningUnit } from "./LearningUnit";

describe("LearningUnit", () => {
  it("creates successfully without specifying a questionType", () => {
    const unit = LearningUnit.create(
      { id: "unit-1", curriculumId: "curriculum-math", title: "一次関数", difficulty: 3 },
      "Math",
    );

    expect(unit.questionType).toBeNull();
  });

  it("creates successfully for a valid subject x questionType combination", () => {
    const unit = LearningUnit.create(
      {
        id: "unit-2",
        curriculumId: "curriculum-english",
        title: "不定詞 単語テスト",
        difficulty: 2,
        questionType: "VocabularyTest",
      },
      "English",
    );

    expect(unit.questionType).toBe("VocabularyTest");
  });

  it("throws for a subject that does not support the given questionType", () => {
    expect(() =>
      LearningUnit.create(
        {
          id: "unit-3",
          curriculumId: "curriculum-math",
          title: "一次関数 単語テスト?",
          difficulty: 2,
          questionType: "VocabularyTest",
        },
        "Math",
      ),
    ).toThrow();
  });

  describe("reconstruct", () => {
    it("restores fields without re-checking SubjectQuestionTypePolicy", () => {
      const unit = LearningUnit.reconstruct({
        id: "unit-4",
        curriculumId: "curriculum-math",
        title: "一次関数 単語テスト?",
        difficulty: 2,
        questionType: "VocabularyTest",
      });

      expect(unit.questionType).toBe("VocabularyTest");
    });

    it("restores a null questionType when omitted", () => {
      const unit = LearningUnit.reconstruct({
        id: "unit-5",
        curriculumId: "curriculum-math",
        title: "一次関数",
        difficulty: 3,
      });

      expect(unit.questionType).toBeNull();
    });
  });
});
