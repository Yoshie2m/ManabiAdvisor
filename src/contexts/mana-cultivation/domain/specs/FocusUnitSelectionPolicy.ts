import type { UnderstandingLevel } from "../models/UnderstandingLevel";

export interface FocusUnitSelectionPolicy {
  selectFocusUnit(
    targetLearningUnitIds: readonly string[],
    understandingLevels: readonly UnderstandingLevel[],
  ): string;
}

export const lowestUnderstandingRateFirstPolicy: FocusUnitSelectionPolicy = {
  selectFocusUnit: (targetLearningUnitIds, understandingLevels) => {
    if (targetLearningUnitIds.length === 0) {
      throw new Error("targetLearningUnitIds must not be empty");
    }
    const rateOf = (id: string) =>
      understandingLevels.find((level) => level.learningUnitId === id)?.rate ?? 0;
    return [...targetLearningUnitIds].sort((a, b) => rateOf(a) - rateOf(b))[0];
  },
};
