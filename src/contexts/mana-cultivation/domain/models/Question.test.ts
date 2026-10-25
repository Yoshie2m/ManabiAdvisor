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

  describe("explanation", () => {
    it("defaults to null when omitted", () => {
      const question = Question.create({ id: "q1", learningUnitId: "unit-1", prompt: "3 + 4 =", answer: "7" });

      expect(question.explanation).toBeNull();
    });

    it("keeps the explanation passed to create and reconstruct", () => {
      const props = { id: "q1", learningUnitId: "unit-1", prompt: "3 + 4 =", answer: "7", explanation: "3に4を足す。" };

      expect(Question.create(props).explanation).toBe("3に4を足す。");
      expect(Question.reconstruct(props).explanation).toBe("3に4を足す。");
    });
  });

  describe("imageUrl", () => {
    it("defaults to null when omitted", () => {
      const question = Question.create({ id: "q1", learningUnitId: "unit-1", prompt: "右の写真の機械は？", answer: "トラクター" });

      expect(question.imageUrl).toBeNull();
    });

    it("keeps the imageUrl passed to create and reconstruct", () => {
      const props = {
        id: "q1",
        learningUnitId: "unit-1",
        prompt: "右の写真の機械は？",
        answer: "トラクター",
        imageUrl: "/images/pre-social/02-fig-01.jpg",
      };

      expect(Question.create(props).imageUrl).toBe("/images/pre-social/02-fig-01.jpg");
      expect(Question.reconstruct(props).imageUrl).toBe("/images/pre-social/02-fig-01.jpg");
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
