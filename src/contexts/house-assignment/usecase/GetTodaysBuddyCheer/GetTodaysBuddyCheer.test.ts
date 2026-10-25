import { describe, expect, it } from "vitest";

import type { Buddy } from "../../domain/models/Buddy";
import { BuddyCheer } from "../../domain/models/BuddyCheer";
import type { BuddyCheerRepository } from "../../domain/repositories/BuddyCheerRepository";
import { GetTodaysBuddyCheer } from "./GetTodaysBuddyCheer";

const all = [
  BuddyCheer.create({ id: "amou-0", buddy: "Amou", order: 0, message: "天羽0" }),
  BuddyCheer.create({ id: "kage-0", buddy: "Kageshima", order: 0, message: "影島0" }),
];
const repository: BuddyCheerRepository = {
  async findByBuddy(buddy: Buddy) {
    return all.filter((cheer) => cheer.buddy === buddy);
  },
};

describe("GetTodaysBuddyCheer", () => {
  it("returns today's cheer of the given buddy", async () => {
    const cheer = await new GetTodaysBuddyCheer(repository).execute("Kageshima", new Date("2026-10-26T12:00:00+09:00"));

    expect(cheer?.message).toBe("影島0");
  });
});
