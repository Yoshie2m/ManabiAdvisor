import { describe, expect, it } from "vitest";

import { gradeExamTypePolicy, LAUNCHED_GRADES } from "./GradeExamTypePolicy";

describe("gradeExamTypePolicy", () => {
  it("maps Pre to the elementary entrance exam, plus Eiken", () => {
    expect(gradeExamTypePolicy.availableExamTypesFor("Pre")).toEqual([
      "Elementary6thYearEntranceExam",
      "Eiken",
    ]);
  });

  it("maps Second to the junior high 2nd year regular exam, plus Eiken", () => {
    expect(gradeExamTypePolicy.availableExamTypesFor("Second")).toEqual([
      "JuniorHigh2ndYearRegularExam",
      "Eiken",
    ]);
  });

  it("offers only Eiken for grades without a regular exam yet", () => {
    for (const grade of ["First", "Third", "Fourth", "Fifth", "Sixth"] as const) {
      expect(gradeExamTypePolicy.availableExamTypesFor(grade)).toEqual(["Eiken"]);
    }
  });

  it("LAUNCHED_GRADES lists only the grades with a regular exam today", () => {
    expect(LAUNCHED_GRADES).toEqual(["Pre", "Second"]);
  });
});
