import { describe, expect, it } from "vitest";

import { BuddyCheer } from "../models/BuddyCheer";
import { dailyCheerPolicy } from "./DailyCheerPolicy";

const cheers = [0, 1, 2].map((order) =>
  BuddyCheer.create({ id: `cheer-${order}`, buddy: "Amou", order, message: `フレーズ${order}` }),
);

describe("dailyCheerPolicy", () => {
  it("returns the same cheer at any time on the same day in Japan", () => {
    const morning = dailyCheerPolicy.select(cheers, new Date("2026-10-26T00:00:00+09:00"));
    const night = dailyCheerPolicy.select(cheers, new Date("2026-10-26T23:59:59+09:00"));

    expect(morning).not.toBeNull();
    expect(night?.id).toBe(morning?.id);
  });

  it("moves to the next order the next day and cycles after as many days as there are cheers", () => {
    const day0 = dailyCheerPolicy.select(cheers, new Date("2026-10-26T12:00:00+09:00"))!;
    const day1 = dailyCheerPolicy.select(cheers, new Date("2026-10-27T12:00:00+09:00"))!;
    const day3 = dailyCheerPolicy.select(cheers, new Date("2026-10-29T12:00:00+09:00"))!;

    expect(day1.order).toBe((day0.order + 1) % 3);
    expect(day3.order).toBe(day0.order);
  });

  it("switches at midnight in Japan (15:00 UTC)", () => {
    const before = dailyCheerPolicy.select(cheers, new Date("2026-10-26T14:59:59Z"))!;
    const after = dailyCheerPolicy.select(cheers, new Date("2026-10-26T15:00:00Z"))!;

    expect(after.order).toBe((before.order + 1) % 3);
  });

  it("decides by order regardless of the input order", () => {
    const date = new Date("2026-10-26T12:00:00+09:00");

    expect(dailyCheerPolicy.select([...cheers].reverse(), date)?.id).toBe(dailyCheerPolicy.select(cheers, date)?.id);
  });

  it("returns null when there are no cheers", () => {
    expect(dailyCheerPolicy.select([], new Date())).toBeNull();
  });
});
