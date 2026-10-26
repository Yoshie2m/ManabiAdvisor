import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { Curriculum } from "../../domain/models/Curriculum";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { LearningUnit } from "../../domain/models/LearningUnit";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import { RecordAttempt } from "./RecordAttempt";

const curriculum = Curriculum.create({
  id: "curriculum-math",
  examType: "JuniorHigh2ndYearRegularExam",
  subject: "Math",
  title: "中2数学",
});
const unit = LearningUnit.create(
  { id: "unit-1", curriculumId: "curriculum-math", title: "一次関数", difficulty: 3 },
  "Math",
);

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
  const learningUnitRepository: LearningUnitRepository = {
    async findById(id) {
      return id === unit.id ? unit : null;
    },
    async findByCurriculumId() {
      return [unit];
    },
  };
  const curriculumRepository: CurriculumRepository = {
    async findByExamType() {
      return [curriculum];
    },
    async findById(id) {
      return id === curriculum.id ? curriculum : null;
    },
  };
  return { progresses, cultivationProgressRepository, learningUnitRepository, curriculumRepository };
}

function usecaseFor(repositories: ReturnType<typeof fakeRepositories>) {
  return new RecordAttempt(
    repositories.cultivationProgressRepository,
    repositories.learningUnitRepository,
    repositories.curriculumRepository,
  );
}

describe("RecordAttempt", () => {
  it("records a correct attempt, adds a gel, and persists the progress", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));

    const level = await usecaseFor(repositories).execute(studentId, "unit-1", "q-1", true);

    expect(level.correctCount).toBe(1);
    expect(level.totalCount).toBe(1);
    expect(repositories.progresses.get("student-1")?.getUnderstanding("unit-1").rate).toBe(100);
    expect(repositories.progresses.get("student-1")?.getManaGel("Math").count).toBe(1);
  });

  it("throws when the student has not started cultivation yet", async () => {
    const repositories = fakeRepositories();

    await expect(usecaseFor(repositories).execute(StudentId.fromString("student-1"), "unit-1", "q-1", true)).rejects.toThrow();
  });
});
