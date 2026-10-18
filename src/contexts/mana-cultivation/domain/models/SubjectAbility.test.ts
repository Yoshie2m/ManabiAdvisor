import { describe, expect, it } from "vitest";

import { SubjectAbility } from "./SubjectAbility";

describe("SubjectAbility", () => {
  it("initial() starts at level 0", () => {
    expect(SubjectAbility.initial("English").level).toBe(0);
  });

  it("create() rejects levels outside 0-100", () => {
    expect(() => SubjectAbility.create("English", -1)).toThrow();
    expect(() => SubjectAbility.create("English", 101)).toThrow();
  });

  it("create() accepts boundary values", () => {
    expect(SubjectAbility.create("English", 0).level).toBe(0);
    expect(SubjectAbility.create("English", 100).level).toBe(100);
  });

  it("increase() returns a new instance without mutating the original", () => {
    const original = SubjectAbility.initial("Math");
    const grown = original.increase(5);

    expect(original.level).toBe(0);
    expect(grown.level).toBe(5);
  });

  it("increase() clamps at 100", () => {
    const grown = SubjectAbility.create("Math", 98).increase(5);
    expect(grown.level).toBe(100);
  });

  it("increase() rejects a non-positive amount", () => {
    expect(() => SubjectAbility.initial("Math").increase(0)).toThrow();
    expect(() => SubjectAbility.initial("Math").increase(-1)).toThrow();
  });
});
