import { describe, expect, it } from "vitest";

import { ManaQuality } from "../../domain/models/ManaQuality";
import type { StudentAggregate } from "../../domain/models/StudentAggregate";
import { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";
import { EnrollStudent } from "./EnrollStudent";

function fakeRepository(): StudentRepository & { saved: StudentAggregate[] } {
  const saved: StudentAggregate[] = [];
  return {
    saved,
    async findById() {
      return null;
    },
    async save(student) {
      saved.push(student);
    },
  };
}

describe("EnrollStudent", () => {
  it("creates a StudentAggregate and saves it", async () => {
    const repository = fakeRepository();
    const usecase = new EnrollStudent(repository);
    const manaQuality = ManaQuality.create({ order: 60, chaos: 20, amount: 50 });

    const aggregate = await usecase.execute(StudentId.fromString("student-1"), manaQuality);

    expect(aggregate.id.toString()).toBe("student-1");
    expect(repository.saved).toHaveLength(1);
    expect(repository.saved[0]).toBe(aggregate);
  });
});
