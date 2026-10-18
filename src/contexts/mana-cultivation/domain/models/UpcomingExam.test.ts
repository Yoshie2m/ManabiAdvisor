import { describe, expect, it } from "vitest";

import { UpcomingExam } from "./UpcomingExam";

describe("UpcomingExam", () => {
  it("creates successfully with a non-empty target unit list", () => {
    const exam = new UpcomingExam("exam-1", "JuniorHigh2ndYearRegularExam", new Date("2026-11-01"), [
      "unit-1",
      "unit-2",
    ]);

    expect(exam.id).toBe("exam-1");
    expect(exam.targetLearningUnitIds).toEqual(["unit-1", "unit-2"]);
  });

  it("throws when targetLearningUnitIds is empty", () => {
    expect(
      () => new UpcomingExam("exam-2", "Eiken", new Date("2026-11-01"), []),
    ).toThrow();
  });
});
