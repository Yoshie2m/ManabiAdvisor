import { describe, expect, it } from "vitest";

import { Question } from "../../domain/models/Question";
import type { QuestionRepository } from "../../domain/repositories/QuestionRepository";
import { GetQuestionsForLearningUnit } from "./GetQuestionsForLearningUnit";

function fakeRepository(questions: Question[]): QuestionRepository {
  return {
    async findByLearningUnitId(learningUnitId) {
      return questions.filter((question) => question.learningUnitId === learningUnitId);
    },
  };
}

describe("GetQuestionsForLearningUnit", () => {
  it("returns only the questions belonging to the given learning unit", async () => {
    const matching = Question.create({ id: "q1", learningUnitId: "unit-1", prompt: "3 + 4 =", answer: "7" });
    const other = Question.create({ id: "q2", learningUnitId: "unit-2", prompt: "1 + 1 =", answer: "2" });
    const usecase = new GetQuestionsForLearningUnit(fakeRepository([matching, other]));

    const result = await usecase.execute("unit-1");

    expect(result).toEqual([matching]);
  });
});
