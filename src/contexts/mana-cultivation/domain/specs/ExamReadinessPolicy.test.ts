import { describe, expect, it } from "vitest";

import { UnderstandingLevel } from "../models/UnderstandingLevel";
import { examReadinessPolicy } from "./ExamReadinessPolicy";

describe("examReadinessPolicy", () => {
  it("averages the understanding rates, counting untouched units as 0%", () => {
    const levels = [UnderstandingLevel.create("unit-1", 3, 4), UnderstandingLevel.create("unit-2", 1, 2)];

    const result = examReadinessPolicy.assess(["unit-1", "unit-2", "unit-3"], levels);

    // (75 + 50 + 0) / 3 = 41.67 → 42
    expect(result.readiness).toBe(42);
  });

  it("picks the unit with the lowest understanding as the next task", () => {
    const levels = [UnderstandingLevel.create("unit-1", 3, 4), UnderstandingLevel.create("unit-2", 1, 2)];

    expect(examReadinessPolicy.assess(["unit-1", "unit-2"], levels).focusUnitId).toBe("unit-2");
    expect(examReadinessPolicy.assess(["unit-1", "unit-2", "unit-3"], levels).focusUnitId).toBe("unit-3");
  });

  it("reaches 100 when every unit is fully understood", () => {
    const levels = [UnderstandingLevel.create("unit-1", 2, 2)];

    expect(examReadinessPolicy.assess(["unit-1"], levels).readiness).toBe(100);
  });

  it("returns 0 and no next task when the range is empty", () => {
    expect(examReadinessPolicy.assess([], [])).toEqual({ readiness: 0, focusUnitId: null });
  });
});
