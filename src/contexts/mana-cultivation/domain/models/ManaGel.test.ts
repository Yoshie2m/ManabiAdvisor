import { describe, expect, it } from "vitest";

import { ManaGel } from "./ManaGel";

describe("ManaGel", () => {
  it("none() starts at 0", () => {
    const gel = ManaGel.none("Japanese");

    expect(gel.subject).toBe("Japanese");
    expect(gel.count).toBe(0);
  });

  it("create() accepts a non-negative integer", () => {
    expect(ManaGel.create("Math", 12).count).toBe(12);
  });

  it.each([-1, 1.5, Number.NaN])("create() rejects %s", (count) => {
    expect(() => ManaGel.create("Math", count)).toThrow();
  });

  it("add() returns a new ManaGel without mutating the original", () => {
    const gel = ManaGel.create("English", 3);

    const next = gel.add(1);

    expect(next.count).toBe(4);
    expect(next.subject).toBe("English");
    expect(gel.count).toBe(3);
  });

  it("add() has no upper limit", () => {
    expect(ManaGel.create("Science", 1000).add(1).count).toBe(1001);
  });

  it.each([0, -1, 0.5])("add() rejects %s", (amount) => {
    expect(() => ManaGel.none("SocialStudies").add(amount)).toThrow();
  });

  it("spend() returns a new ManaGel with fewer gels", () => {
    const gel = ManaGel.create("Math", 30);

    expect(gel.spend(30).count).toBe(0);
    expect(gel.count).toBe(30);
  });

  it("spend() rejects spending more than owned", () => {
    expect(() => ManaGel.create("Math", 29).spend(30)).toThrow();
  });

  it.each([0, -1, 0.5])("spend() rejects %s", (amount) => {
    expect(() => ManaGel.create("Math", 10).spend(amount)).toThrow();
  });
});
