import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import { ChangeGrade } from "./ChangeGrade";

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

describe("ChangeGrade", () => {
  it("changes the grade and persists the progress", async () => {
    const { repository, progresses } = fakeRepository();
    const studentId = StudentId.fromString("student-1");
    progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new ChangeGrade(repository);

    const progress = await usecase.execute(studentId, "Pre");

    expect(progress.grade).toBe("Pre");
    expect(progresses.get("student-1")?.grade).toBe("Pre");
  });

  it("throws when the student has not started cultivation yet", async () => {
    const { repository } = fakeRepository();
    const usecase = new ChangeGrade(repository);

    await expect(usecase.execute(StudentId.fromString("student-1"), "Pre")).rejects.toThrow();
  });
});
