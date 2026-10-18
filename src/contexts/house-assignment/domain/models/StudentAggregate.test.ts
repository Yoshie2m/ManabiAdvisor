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
  });
});
