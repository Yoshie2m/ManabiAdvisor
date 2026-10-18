import { describe, expect, it } from "vitest";

import { UnderstandingLevel } from "./UnderstandingLevel";

describe("UnderstandingLevel", () => {
  it("zero() starts at 0/0 with rate 0", () => {
    const level = UnderstandingLevel.zero("unit-1");
    expect(level.correctCount).toBe(0);
    expect(level.totalCount).toBe(0);
    expect(level.rate).toBe(0);
  });

  it("create() rejects correctCount greater than totalCount", () => {
    expect(() => UnderstandingLevel.create("unit-1", 3, 2)).toThrow();
  });

  it("recordAttempt(true) increments both correctCount and totalCount", () => {
    const next = UnderstandingLevel.zero("unit-1").recordAttempt(true);
    expect(next.correctCount).toBe(1);
    expect(next.totalCount).toBe(1);
  });

  it("recordAttempt(false) increments only totalCount", () => {
    const next = UnderstandingLevel.zero("unit-1").recordAttempt(false);
    expect(next.correctCount).toBe(0);
    expect(next.totalCount).toBe(1);
  });

  it("rate() returns a rounded percentage", () => {
    const level = UnderstandingLevel.create("unit-1", 1, 3);
    expect(level.rate).toBe(33);
  });
});
