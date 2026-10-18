import { describe, expect, it } from "vitest";

import { Mission } from "./Mission";
import { UpcomingExam } from "./UpcomingExam";

describe("Mission", () => {
  it("assignDaily() targets exactly one learning unit", () => {
    const mission = Mission.assignDaily("mission-1", "unit-1");
    expect(mission.type).toBe("Daily");
    expect(mission.targetLearningUnitIds).toEqual(["unit-1"]);
  });

  it("offerMockExam() targets the upcoming exam's full scope", () => {
    const exam = new UpcomingExam("exam-1", "JuniorHigh2ndYearRegularExam", new Date("2026-11-01"), [
      "unit-1",
      "unit-2",
      "unit-3",
    ]);
    const mission = Mission.offerMockExam("mission-2", exam);

    expect(mission.type).toBe("MockExam");
    expect(mission.targetLearningUnitIds).toEqual(["unit-1", "unit-2", "unit-3"]);
  });
});
