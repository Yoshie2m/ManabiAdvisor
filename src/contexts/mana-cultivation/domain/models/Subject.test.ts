import { describe, expect, it } from "vitest";

import { isSubject, SUBJECTS } from "./Subject";

describe("Subject", () => {
  it("has exactly the five major subjects", () => {
    expect(SUBJECTS).toEqual(["English", "Math", "Japanese", "Science", "SocialStudies"]);
  });

  it.each(SUBJECTS)("isSubject returns true for %s", (subject) => {
    expect(isSubject(subject)).toBe(true);
  });

  it("isSubject returns false for an unknown value", () => {
    expect(isSubject("PE")).toBe(false);
  });
});
