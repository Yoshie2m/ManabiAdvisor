import { describe, expect, it } from "vitest";

import { UpcomingExam } from "./UpcomingExam";

describe("UpcomingExam", () => {
  it("keeps the title, date and target units", () => {
    const exam = UpcomingExam.create({
      id: "exam-kanji-test1",
      title: "漢字テストI",
      examType: "JuniorHigh2ndYearRegularExam",
      scheduledDate: new Date("2026-11-04T00:00:00+09:00"),
      targetLearningUnitIds: ["unit-1", "unit-2"],
    });

    expect(exam.id).toBe("exam-kanji-test1");
    expect(exam.title).toBe("漢字テストI");
    expect(exam.targetLearningUnitIds).toEqual(["unit-1", "unit-2"]);
  });

  it("allows an exam whose range is not registered yet", () => {
    const exam = UpcomingExam.create({
      id: "exam-kanji-test3",
      title: "漢字テストIII",
      examType: "JuniorHigh2ndYearRegularExam",
      scheduledDate: new Date("2026-11-12T00:00:00+09:00"),
      targetLearningUnitIds: [],
    });

    expect(exam.targetLearningUnitIds).toEqual([]);
  });

  it.each(["", "  "])("rejects an empty title %j", (title) => {
    expect(() =>
      UpcomingExam.create({
        id: "exam-1",
        title,
        examType: "JuniorHigh2ndYearRegularExam",
        scheduledDate: new Date("2026-11-04T00:00:00+09:00"),
        targetLearningUnitIds: ["unit-1"],
      }),
    ).toThrow();
  });
});
