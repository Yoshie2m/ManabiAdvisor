import { describe, expect, it } from "vitest";

import { curriculumSubjectSpecification } from "./CurriculumSubjectSpecification";

describe("curriculumSubjectSpecification", () => {
  it("offers all five subjects for JuniorHigh2ndYearRegularExam", () => {
    for (const subject of ["English", "Math", "Japanese", "Science", "SocialStudies"] as const) {
      expect(
        curriculumSubjectSpecification.isSatisfiedBy("JuniorHigh2ndYearRegularExam", subject),
      ).toBe(true);
    }
  });

  it("offers only English for Eiken", () => {
    expect(curriculumSubjectSpecification.isSatisfiedBy("Eiken", "English")).toBe(true);
    for (const subject of ["Math", "Japanese", "Science", "SocialStudies"] as const) {
      expect(curriculumSubjectSpecification.isSatisfiedBy("Eiken", subject)).toBe(false);
    }
  });

  it("offers everything except English for Elementary6thYearEntranceExam", () => {
    expect(
      curriculumSubjectSpecification.isSatisfiedBy("Elementary6thYearEntranceExam", "English"),
    ).toBe(false);
    for (const subject of ["Math", "Japanese", "Science", "SocialStudies"] as const) {
      expect(
        curriculumSubjectSpecification.isSatisfiedBy("Elementary6thYearEntranceExam", subject),
      ).toBe(true);
    }
  });
});
