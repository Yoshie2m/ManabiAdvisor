import { describe, expect, it } from "vitest";

import { UnderstandingLevel } from "../models/UnderstandingLevel";
import { lowestUnderstandingRateFirstPolicy } from "./FocusUnitSelectionPolicy";

describe("lowestUnderstandingRateFirstPolicy", () => {
  it("selects the unit with the lowest understanding rate", () => {
    const levels = [
      UnderstandingLevel.create("unit-1", 9, 10), // rate 90
      UnderstandingLevel.create("unit-2", 1, 10), // rate 10
      UnderstandingLevel.create("unit-3", 5, 10), // rate 50
    ];

    const focusUnit = lowestUnderstandingRateFirstPolicy.selectFocusUnit(
      ["unit-1", "unit-2", "unit-3"],
      levels,
    );

    expect(focusUnit).toBe("unit-2");
  });

  it("treats a unit with no recorded understanding as rate 0 and prioritizes it", () => {
    const levels = [UnderstandingLevel.create("unit-1", 9, 10)];

    const focusUnit = lowestUnderstandingRateFirstPolicy.selectFocusUnit(
      ["unit-1", "unit-2"],
      levels,
    );

    expect(focusUnit).toBe("unit-2");
  });

  it("throws when the target unit list is empty", () => {
    expect(() => lowestUnderstandingRateFirstPolicy.selectFocusUnit([], [])).toThrow();
  });
});
