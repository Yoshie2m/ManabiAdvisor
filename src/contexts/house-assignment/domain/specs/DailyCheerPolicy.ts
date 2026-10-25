import type { BuddyCheer } from "../models/BuddyCheer";

export interface DailyCheerPolicy {
  select(cheers: readonly BuddyCheer[], today: Date): BuddyCheer | null;
}

const JAPAN_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// 日本時間の日付で1日1つ。同じ日は同じフレーズ、翌日は次のorder、フレーズ数の日数で一巡する。
export const dailyCheerPolicy: DailyCheerPolicy = {
  select: (cheers, today) => {
    if (cheers.length === 0) {
      return null;
    }
    const sorted = [...cheers].sort((a, b) => a.order - b.order);
    const dayNumber = Math.floor((today.getTime() + JAPAN_OFFSET_MS) / DAY_MS);
    return sorted[dayNumber % sorted.length];
  },
};
