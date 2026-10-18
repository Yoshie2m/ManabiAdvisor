import { describe, expect, it } from "vitest";

import { Curriculum } from "./Curriculum";

describe("Curriculum", () => {
  it("creates successfully for a valid examType x subject combination", () => {
    const curriculum = Curriculum.create({
      id: "c1",
      examType: "JuniorHigh2ndYearRegularExam",
      subject: "Math",
      title: "中2数学 定期テスト対策",
    });

    expect(curriculum.id).toBe("c1");
    expect(curriculum.examType).toBe("JuniorHigh2ndYearRegularExam");
    expect(curriculum.subject).toBe("Math");
    expect(curriculum.title).toBe("中2数学 定期テスト対策");
  });

  it("throws for an invalid examType x subject combination", () => {
    expect(() =>
      Curriculum.create({
        id: "c2",
        examType: "Eiken",
        subject: "Science",
        title: "英検理科?",
      }),
    ).toThrow();
  });

  describe("reconstruct", () => {
    it("restores fields without re-checking CurriculumSubjectSpecification", () => {
      const curriculum = Curriculum.reconstruct({
        id: "c3",
        examType: "Eiken",
        subject: "Science",
        title: "英検理科?",
      });

      expect(curriculum.examType).toBe("Eiken");
      expect(curriculum.subject).toBe("Science");
    });
  });
});
