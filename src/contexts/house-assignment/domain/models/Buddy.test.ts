import { describe, expect, it } from "vitest";

import { BUDDIES, isBuddy } from "./Buddy";

describe("Buddy", () => {
  it("has Amou and Kageshima", () => {
    expect(BUDDIES).toEqual(["Amou", "Kageshima"]);
  });

  it.each(["Amou", "Kageshima"])("isBuddy accepts %s", (value) => {
    expect(isBuddy(value)).toBe(true);
  });

  it.each(["amou", "Tenshi", ""])("isBuddy rejects %s", (value) => {
    expect(isBuddy(value)).toBe(false);
  });
});
