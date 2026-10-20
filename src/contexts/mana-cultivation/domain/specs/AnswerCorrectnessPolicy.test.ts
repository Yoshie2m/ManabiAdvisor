import { describe, expect, it } from "vitest";

import { answerCorrectnessPolicy } from "./AnswerCorrectnessPolicy";

describe("answerCorrectnessPolicy", () => {
  it("is satisfied when the submitted answer exactly matches the correct answer", () => {
    expect(answerCorrectnessPolicy.isSatisfiedBy("悲哀", "悲哀")).toBe(true);
  });

  it("is satisfied when only surrounding whitespace differs", () => {
    expect(answerCorrectnessPolicy.isSatisfiedBy("  悲哀  ", "悲哀")).toBe(true);
    expect(answerCorrectnessPolicy.isSatisfiedBy("ひあい", "  ひあい")).toBe(true);
  });

  it("is not satisfied when the characters differ", () => {
    expect(answerCorrectnessPolicy.isSatisfiedBy("悲愛", "悲哀")).toBe(false);
  });

  it("is not satisfied when whitespace appears in the middle of the answer", () => {
    expect(answerCorrectnessPolicy.isSatisfiedBy("ひ あい", "ひあい")).toBe(false);
  });
});
