import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { Curriculum } from "../../domain/models/Curriculum";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { LearningUnit } from "../../domain/models/LearningUnit";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import { CompleteLearningUnit } from "./CompleteLearningUnit";

const curriculum = Curriculum.create({
  id: "curriculum-math",
  examType: "JuniorHigh2ndYearRegularExam",
  subject: "Math",
  title: "中2数学",
});
const unit = LearningUnit.create(
  { id: "unit-math-1", curriculumId: "curriculum-math", title: "一次関数", difficulty: 3 },
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
  const curriculumRepository: CurriculumRepository = {
    async findByExamType() {
      return [curriculum];
    },
    async findById(id) {
      return id === curriculum.id ? curriculum : null;
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
  return { cultivationProgressRepository, curriculumRepository, learningUnitRepository, progresses };
}

describe("CompleteLearningUnit", () => {
  it("grows the matching subject's ability and persists the progress", async () => {
    const { cultivationProgressRepository, curriculumRepository, learningUnitRepository, progresses } =
      fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new CompleteLearningUnit(
      cultivationProgressRepository,
      curriculumRepository,
      learningUnitRepository,
    );

    const ability = await usecase.execute(studentId, unit.id);

    expect(ability.level).toBe(5);
    expect(progresses.get("student-1")?.getAbility("Math").level).toBe(5);
  });

  it("throws when the learning unit does not exist", async () => {
    const { cultivationProgressRepository, curriculumRepository, learningUnitRepository, progresses } =
      fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new CompleteLearningUnit(
      cultivationProgressRepository,
      curriculumRepository,
      learningUnitRepository,
    );

    await expect(usecase.execute(studentId, "missing")).rejects.toThrow();
  });

  it("throws when the student has not started cultivation yet", async () => {
    const { cultivationProgressRepository, curriculumRepository, learningUnitRepository } =
      fakeRepositories();
    const usecase = new CompleteLearningUnit(
      cultivationProgressRepository,
      curriculumRepository,
      learningUnitRepository,
    );

    await expect(usecase.execute(StudentId.fromString("student-1"), unit.id)).rejects.toThrow();
  });
});
