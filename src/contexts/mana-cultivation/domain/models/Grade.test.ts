import { describe, expect, it } from "vitest";

import { GRADES, isGrade } from "./Grade";

describe("Grade", () => {
  it("has the seven stages from Pre to Sixth", () => {
    expect(GRADES).toEqual(["Pre", "First", "Second", "Third", "Fourth", "Fifth", "Sixth"]);
  });

  it.each(GRADES)("isGrade returns true for %s", (grade) => {
    expect(isGrade(grade)).toBe(true);
  });

  it("isGrade returns false for an unknown value", () => {
    expect(isGrade("Seventh")).toBe(false);
  });
});
