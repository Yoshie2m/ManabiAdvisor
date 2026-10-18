import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import { StartCultivation } from "./StartCultivation";

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

describe("StartCultivation", () => {
  it("initiates and persists a CultivationProgress for the given grade", async () => {
    const { repository, progresses } = fakeRepository();
    const usecase = new StartCultivation(repository);
    const studentId = StudentId.fromString("student-1");

    const progress = await usecase.execute(studentId, "Pre");

    expect(progress.grade).toBe("Pre");
    expect(progresses.get("student-1")).toBe(progress);
  });
});
