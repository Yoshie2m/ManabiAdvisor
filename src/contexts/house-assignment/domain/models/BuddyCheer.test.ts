import { describe, expect, it } from "vitest";

import { BuddyCheer } from "./BuddyCheer";

describe("BuddyCheer", () => {
  it("keeps its fields", () => {
    const cheer = BuddyCheer.create({ id: "cheer-amou-01", buddy: "Amou", order: 0, message: "おっす！" });

    expect(cheer.id).toBe("cheer-amou-01");
    expect(cheer.buddy).toBe("Amou");
    expect(cheer.order).toBe(0);
    expect(cheer.message).toBe("おっす！");
  });

  it.each(["", "   "])("rejects an empty message %j", (message) => {
    expect(() => BuddyCheer.create({ id: "c", buddy: "Amou", order: 0, message })).toThrow();
  });

  it.each([-1, 1.5])("rejects order %s", (order) => {
    expect(() => BuddyCheer.create({ id: "c", buddy: "Amou", order, message: "がんばれ" })).toThrow();
  });
});
