import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { SUBJECTS } from "./Subject";
import { Curriculum } from "./Curriculum";
import { CultivationProgress } from "./CultivationProgress";
import { LearningUnit } from "./LearningUnit";
import { Mission } from "./Mission";
import { SubjectAbility } from "./SubjectAbility";
import { UnderstandingLevel } from "./UnderstandingLevel";
import { UpcomingExam } from "./UpcomingExam";

function initiate() {
  return CultivationProgress.initiate(StudentId.fromString("student-1"), "Second");
}

describe("CultivationProgress", () => {
  it("initiate() starts every subject at level 0", () => {
    const progress = initiate();
    for (const subject of SUBJECTS) {
      expect(progress.getAbility(subject).level).toBe(0);
    }
  });

  it("initiate() records the given grade", () => {
    expect(initiate().grade).toBe("Second");
  });

  describe("completeLearningUnit", () => {
    const curriculum = Curriculum.create({
      id: "curriculum-1",
      examType: "JuniorHigh2ndYearRegularExam",
      subject: "Math",
      title: "中2数学",
    });
    const unit = LearningUnit.create(
      { id: "unit-1", curriculumId: "curriculum-1", title: "一次関数", difficulty: 3 },
      "Math",
    );

    it("increases only the matching subject's ability", () => {
      const progress = initiate();
      progress.completeLearningUnit(curriculum, unit);

      expect(progress.getAbility("Math").level).toBe(5);
      expect(progress.getAbility("English").level).toBe(0);
    });

    it("throws when the learning unit does not belong to the curriculum", () => {
      const progress = initiate();
      const mismatched = LearningUnit.create(
        { id: "unit-2", curriculumId: "other-curriculum", title: "別単元", difficulty: 1 },
        "Math",
      );

      expect(() => progress.completeLearningUnit(curriculum, mismatched)).toThrow();
      expect(progress.getAbility("Math").level).toBe(0);
    });

    it("keeps increasing on repeated completion, clamped at 100", () => {
      const progress = initiate();
      for (let i = 0; i < 25; i += 1) {
        progress.completeLearningUnit(curriculum, unit);
      }
      expect(progress.getAbility("Math").level).toBe(100);
    });
  });

  describe("recordAttempt", () => {
    it("updates only the targeted unit's understanding level", () => {
      const progress = initiate();
      progress.recordAttempt("unit-1", true);
      progress.recordAttempt("unit-1", false);

      const level = progress.getUnderstanding("unit-1");
      expect(level.correctCount).toBe(1);
      expect(level.totalCount).toBe(2);
      expect(progress.getUnderstanding("unit-2").totalCount).toBe(0);
    });
  });

  describe("assignDailyMission", () => {
    it("targets the weakest unit in the exam scope", () => {
      const progress = initiate();
      progress.recordAttempt("unit-1", true); // rate 100
      progress.recordAttempt("unit-2", false); // rate 0
      const exam = new UpcomingExam(
        "exam-1",
        "JuniorHigh2ndYearRegularExam",
        new Date("2026-11-01"),
        ["unit-1", "unit-2"],
      );

      const mission = progress.assignDailyMission(exam, "mission-1");

      expect(mission.type).toBe("Daily");
      expect(mission.targetLearningUnitIds).toEqual(["unit-2"]);
      expect(progress.getCurrentDailyMission()).toBe(mission);
    });
  });

  describe("offerMockExamMission", () => {
    it("targets the exam's full scope", () => {
      const progress = initiate();
      const exam = new UpcomingExam(
        "exam-1",
        "JuniorHigh2ndYearRegularExam",
        new Date("2026-11-01"),
        ["unit-1", "unit-2", "unit-3"],
      );

      const mission = progress.offerMockExamMission(exam, "mission-2");

      expect(mission.type).toBe("MockExam");
      expect(mission.targetLearningUnitIds).toEqual(["unit-1", "unit-2", "unit-3"]);
      expect(progress.getMockExamMission()).toBe(mission);
    });
  });

  describe("getUnderstandingLevels", () => {
    it("exposes every recorded understanding level, keyed by learningUnitId", () => {
      const progress = initiate();
      progress.recordAttempt("unit-1", true);

      const levels = progress.getUnderstandingLevels();

      expect(levels.size).toBe(1);
      expect(levels.get("unit-1")?.correctCount).toBe(1);
    });
  });

  describe("reconstruct", () => {
    it("restores abilities, understanding levels, and missions without re-deriving them", () => {
      const studentId = StudentId.fromString("student-1");
      const abilities = new Map(SUBJECTS.map((subject) => [subject, SubjectAbility.create(subject, 42)]));
      const understandingLevels = new Map([["unit-1", UnderstandingLevel.create("unit-1", 3, 4)]]);
      const dailyMission = Mission.reconstruct("mission-daily", "Daily", ["unit-1"]);
      const mockExamMission = Mission.reconstruct("mission-mock", "MockExam", ["unit-1", "unit-2"]);

      const progress = CultivationProgress.reconstruct({
        studentId,
        grade: "Second",
        abilities,
        understandingLevels,
        currentDailyMission: dailyMission,
        currentMockExamMission: mockExamMission,
      });

      expect(progress.studentId).toBe(studentId);
      expect(progress.grade).toBe("Second");
      expect(progress.getAbility("Math").level).toBe(42);
      expect(progress.getUnderstanding("unit-1").correctCount).toBe(3);
      expect(progress.getCurrentDailyMission()).toBe(dailyMission);
      expect(progress.getMockExamMission()).toBe(mockExamMission);
    });

    it("restores null missions as-is", () => {
      const abilities = new Map(SUBJECTS.map((subject) => [subject, SubjectAbility.initial(subject)]));
      const progress = CultivationProgress.reconstruct({
        studentId: StudentId.fromString("student-1"),
        grade: "Pre",
        abilities,
        understandingLevels: new Map(),
        currentDailyMission: null,
        currentMockExamMission: null,
      });

      expect(progress.getCurrentDailyMission()).toBeNull();
      expect(progress.getMockExamMission()).toBeNull();
    });
  });
});
