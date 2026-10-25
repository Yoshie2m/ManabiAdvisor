import { describe, expect, it } from "vitest";

import { GelCost } from "./GelCost";

describe("GelCost", () => {
  it("keeps the subject and count", () => {
    const cost = GelCost.create("Math", 30);

    expect(cost.subject).toBe("Math");
    expect(cost.count).toBe(30);
  });

  it.each([0, -1, 2.5])("rejects count %s", (count) => {
    expect(() => GelCost.create("Math", count)).toThrow();
  });
});
