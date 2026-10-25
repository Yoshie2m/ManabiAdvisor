import { describe, expect, it } from "vitest";

import { StudentAggregate } from "../../domain/models/StudentAggregate";
import { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";
import { ChooseBuddy } from "./ChooseBuddy";

function fakeRepository() {
  const students = new Map<string, StudentAggregate>();
  const repository: StudentRepository = {
    async findById(id) {
      return students.get(id.toString()) ?? null;
    },
    async save(student) {
      students.set(student.id.toString(), student);
    },
  };
  return { repository, students };
}

describe("ChooseBuddy", () => {
  it("saves the chosen buddy", async () => {
    const { repository, students } = fakeRepository();
    const studentId = StudentId.fromString("student-1");
    students.set("student-1", StudentAggregate.create(studentId, "RoseSleep"));

    const student = await new ChooseBuddy(repository).execute(studentId, "Kageshima");

    expect(student.buddy).toBe("Kageshima");
    expect(students.get("student-1")?.buddy).toBe("Kageshima");
  });

  it("throws when the student is not enrolled", async () => {
    const { repository } = fakeRepository();

    await expect(new ChooseBuddy(repository).execute(StudentId.fromString("student-1"), "Amou")).rejects.toThrow();
  });
});
