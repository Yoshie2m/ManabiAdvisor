import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import { RecordQuizAttempts } from "./RecordQuizAttempts";

function fakeRepository() {
  const progresses = new Map<string, CultivationProgress>();
  const cultivationProgressRepository: CultivationProgressRepository = {
    async findByStudentId(studentId) {
      return progresses.get(studentId.toString()) ?? null;
    },
    async save(progress) {
      progresses.set(progress.studentId.toString(), progress);
    },
  };
  return { progresses, cultivationProgressRepository };
}

describe("RecordQuizAttempts", () => {
  it("records every result without advancing any session state", async () => {
    const { progresses, cultivationProgressRepository } = fakeRepository();
    const studentId = StudentId.fromString("student-1");
    progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new RecordQuizAttempts(cultivationProgressRepository);

    await usecase.execute(studentId, "unit-kanji-write", [
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
    ]);

    const understanding = progresses.get("student-1")?.getUnderstanding("unit-kanji-write");
    expect(understanding?.totalCount).toBe(3);
    expect(understanding?.correctCount).toBe(2);
  });

  it("throws when the student has not started cultivation yet", async () => {
    const { cultivationProgressRepository } = fakeRepository();
    const usecase = new RecordQuizAttempts(cultivationProgressRepository);

    await expect(
      usecase.execute(StudentId.fromString("student-1"), "unit-kanji-write", [{ isCorrect: true }]),
    ).rejects.toThrow();
  });
});
