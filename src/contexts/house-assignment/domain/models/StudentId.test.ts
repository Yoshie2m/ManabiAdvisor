import { describe, expect, it } from "vitest";

import { StudentId } from "./StudentId";

describe("StudentId", () => {
  it("throws for an empty string", () => {
    expect(() => StudentId.fromString("")).toThrow();
  });

  it("throws for a whitespace-only string", () => {
    expect(() => StudentId.fromString("   ")).toThrow();
  });

  it("creates successfully for a non-empty string", () => {
    expect(StudentId.fromString("student-1").toString()).toBe("student-1");
  });

  describe("equals", () => {
    it("returns true for two ids with the same value", () => {
      expect(StudentId.fromString("student-1").equals(StudentId.fromString("student-1"))).toBe(true);
    });

    it("returns false for ids with different values", () => {
      expect(StudentId.fromString("student-1").equals(StudentId.fromString("student-2"))).toBe(false);
    });
  });
});
