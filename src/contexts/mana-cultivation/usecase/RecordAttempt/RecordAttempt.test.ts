import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import { RecordAttempt } from "./RecordAttempt";

function fakeRepository() {
  const progresses = new Map<string, CultivationProgress>();
  const repository: CultivationProgressRepository = {
    async findByStudentId(studentId) {
      return progresses.get(studentId.toString()) ?? null;
    },
    async save(progress) {
      progresses.set(progress.studentId.toString(), progress);
    },
  };
  return { repository, progresses };
}

describe("RecordAttempt", () => {
  it("records a correct attempt and persists the progress", async () => {
    const { repository, progresses } = fakeRepository();
    const studentId = StudentId.fromString("student-1");
    progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new RecordAttempt(repository);

    const level = await usecase.execute(studentId, "unit-1", true);

    expect(level.correctCount).toBe(1);
    expect(level.totalCount).toBe(1);
    expect(progresses.get("student-1")?.getUnderstanding("unit-1").rate).toBe(100);
  });

  it("throws when the student has not started cultivation yet", async () => {
    const { repository } = fakeRepository();
    const usecase = new RecordAttempt(repository);

    await expect(
      usecase.execute(StudentId.fromString("student-1"), "unit-1", true),
    ).rejects.toThrow();
  });
});
