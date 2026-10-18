import { describe, expect, it } from "vitest";

import { ManaQuality } from "./ManaQuality";
import { StudentAggregate } from "./StudentAggregate";
import { StudentId } from "./StudentId";

describe("StudentAggregate", () => {
  it("create() exposes the given id and manaQuality, with no house yet", () => {
    const manaQuality = ManaQuality.create({ order: 60, chaos: 20, amount: 50 });
    const aggregate = StudentAggregate.create(StudentId.fromString("student-1"), manaQuality);

    expect(aggregate.id.toString()).toBe("student-1");
    expect(aggregate.manaQuality).toBe(manaQuality);
    expect(aggregate.house).toBeNull();
  });

  describe("reconstruct", () => {
    it("restores a previously assigned house without re-deriving it", () => {
      const manaQuality = ManaQuality.create({ order: 20, chaos: 60, amount: 50 });
      const aggregate = StudentAggregate.reconstruct(
        StudentId.fromString("student-1"),
        manaQuality,
        "RegiusCardis",
      );

      expect(aggregate.house).toBe("RegiusCardis");
    });

    it("restores a null house as-is", () => {
      const manaQuality = ManaQuality.create({ order: 60, chaos: 20, amount: 50 });
      const aggregate = StudentAggregate.reconstruct(StudentId.fromString("student-1"), manaQuality, null);

      expect(aggregate.house).toBeNull();
    });
  });
});
