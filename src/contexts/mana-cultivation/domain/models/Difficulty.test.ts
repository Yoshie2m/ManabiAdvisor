import { describe, expect, it } from "vitest";

import { isDifficulty } from "./Difficulty";

describe("isDifficulty", () => {
  it.each([1, 2, 3, 4, 5])("returns true for %i", (value) => {
    expect(isDifficulty(value)).toBe(true);
  });

  it.each([0, 6, 2.5, -1])("returns false for %s", (value) => {
    expect(isDifficulty(value)).toBe(false);
  });
});
