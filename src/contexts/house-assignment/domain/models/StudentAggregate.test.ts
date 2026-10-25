import { describe, expect, it } from "vitest";

import { StudentAggregate } from "./StudentAggregate";
import { StudentId } from "./StudentId";

describe("StudentAggregate", () => {
  describe("create", () => {
    it("confirms the chosen RegiusCardis house as-is", () => {
      const aggregate = StudentAggregate.create(StudentId.fromString("student-1"), "RegiusCardis");

      expect(aggregate.id.toString()).toBe("student-1");
      expect(aggregate.house).toBe("RegiusCardis");
    });

    it("confirms the chosen RoseSleep house as-is", () => {
      const aggregate = StudentAggregate.create(StudentId.fromString("student-1"), "RoseSleep");

      expect(aggregate.house).toBe("RoseSleep");
    });

    it("starts without a buddy", () => {
      expect(StudentAggregate.create(StudentId.fromString("student-1"), "RoseSleep").buddy).toBeNull();
    });

    it("restores a persisted buddy", () => {
      expect(StudentAggregate.create(StudentId.fromString("student-1"), "RoseSleep", "Kageshima").buddy).toBe("Kageshima");
    });
  });

  describe("chooseBuddy", () => {
    it("sets the chosen buddy and can be chosen again without touching the house", () => {
      const aggregate = StudentAggregate.create(StudentId.fromString("student-1"), "RegiusCardis");

      aggregate.chooseBuddy("Amou");
      expect(aggregate.buddy).toBe("Amou");

      aggregate.chooseBuddy("Kageshima");
      expect(aggregate.buddy).toBe("Kageshima");
      expect(aggregate.house).toBe("RegiusCardis");
    });
  });
});
