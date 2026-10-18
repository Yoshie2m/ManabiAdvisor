import { describe, expect, it } from "vitest";

import { Question } from "./Question";

describe("Question", () => {
  describe("create", () => {
    it("creates successfully with a non-empty prompt and answer", () => {
      const question = Question.create({
        id: "q1",
        learningUnitId: "unit-1",
        prompt: "3 + 4 =",
        answer: "7",
      });

      expect(question.prompt).toBe("3 + 4 =");
      expect(question.answer).toBe("7");
    });

    it("throws for an empty prompt", () => {
      expect(() =>
        Question.create({ id: "q1", learningUnitId: "unit-1", prompt: "  ", answer: "7" }),
      ).toThrow();
    });

    it("throws for an empty answer", () => {
      expect(() =>
        Question.create({ id: "q1", learningUnitId: "unit-1", prompt: "3 + 4 =", answer: "" }),
      ).toThrow();
    });
  });

  describe("reconstruct", () => {
    it("restores fields without re-checking for empty prompt/answer", () => {
      const question = Question.reconstruct({
        id: "q1",
        learningUnitId: "unit-1",
        prompt: "3 + 4 =",
        answer: "7",
      });

      expect(question.prompt).toBe("3 + 4 =");
      expect(question.answer).toBe("7");
    });
  });
});
