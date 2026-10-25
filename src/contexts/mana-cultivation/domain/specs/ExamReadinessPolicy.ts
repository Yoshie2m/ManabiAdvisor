import type { UnderstandingLevel } from "../models/UnderstandingLevel";
import { lowestUnderstandingRateFirstPolicy } from "./FocusUnitSelectionPolicy";

export type ExamReadiness = { readiness: number; focusUnitId: string | null };

export interface ExamReadinessPolicy {
  assess(targetLearningUnitIds: readonly string[], understandingLevels: readonly UnderstandingLevel[]): ExamReadiness;
}

// 準備状態は範囲の単元の理解度の平均（未着手は0%）。次のタスクは理解度が一番低い単元（第21回ヒアリング）。
export const examReadinessPolicy: ExamReadinessPolicy = {
  assess: (targetLearningUnitIds, understandingLevels) => {
    if (targetLearningUnitIds.length === 0) {
      return { readiness: 0, focusUnitId: null };
    }
    const rateOf = (id: string) => understandingLevels.find((level) => level.learningUnitId === id)?.rate ?? 0;
    const total = targetLearningUnitIds.reduce((sum, id) => sum + rateOf(id), 0);
    return {
      readiness: Math.round(total / targetLearningUnitIds.length),
      focusUnitId: lowestUnderstandingRateFirstPolicy.selectFocusUnit(targetLearningUnitIds, understandingLevels),
    };
  },
};
