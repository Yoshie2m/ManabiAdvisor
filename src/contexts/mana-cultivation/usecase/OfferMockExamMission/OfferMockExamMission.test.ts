import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { UpcomingExam } from "../../domain/models/UpcomingExam";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";
import { OfferMockExamMission } from "./OfferMockExamMission";

const exam = new UpcomingExam("exam-1", "JuniorHigh2ndYearRegularExam", new Date("2026-11-15"), [
  "unit-1",
  "unit-2",
  "unit-3",
]);

function fakeRepositories() {
  const progresses = new Map<string, CultivationProgress>();
  const cultivationProgressRepository: CultivationProgressRepository = {
    async findByStudentId(studentId) {
      return progresses.get(studentId.toString()) ?? null;
    },
    async save(progress) {
      progresses.set(progress.studentId.toString(), progress);
    },
  };
  const upcomingExamRepository: UpcomingExamRepository = {
    async findByExamType(examType) {
      return examType === exam.examType ? exam : null;
    },
  };
  return { cultivationProgressRepository, upcomingExamRepository, progresses };
}

describe("OfferMockExamMission", () => {
  it("offers a mock exam mission covering the full exam scope for the student's grade", async () => {
    const { cultivationProgressRepository, upcomingExamRepository, progresses } = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new OfferMockExamMission(cultivationProgressRepository, upcomingExamRepository);

    const mission = await usecase.execute(studentId, "mission-1");

    expect(mission.type).toBe("MockExam");
    expect(mission.targetLearningUnitIds).toEqual(["unit-1", "unit-2", "unit-3"]);
    expect(progresses.get("student-1")?.getMockExamMission()).toBe(mission);
  });

  it("throws when the student has not started cultivation yet", async () => {
    const { cultivationProgressRepository, upcomingExamRepository } = fakeRepositories();
    const usecase = new OfferMockExamMission(cultivationProgressRepository, upcomingExamRepository);

    await expect(
      usecase.execute(StudentId.fromString("student-1"), "mission-1"),
    ).rejects.toThrow();
  });
});
