import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { Curriculum } from "../../domain/models/Curriculum";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { LearningUnit } from "../../domain/models/LearningUnit";
import { UpcomingExam } from "../../domain/models/UpcomingExam";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";
import { GetCultivationOverview } from "./GetCultivationOverview";

const mathCurriculum = Curriculum.create({
  id: "curriculum-math",
  examType: "JuniorHigh2ndYearRegularExam",
  subject: "Math",
  title: "中2数学",
});
const unit1 = LearningUnit.create(
  { id: "unit-math-1", curriculumId: "curriculum-math", title: "一次関数", difficulty: 3 },
  "Math",
);
const exam = new UpcomingExam("exam-1", "JuniorHigh2ndYearRegularExam", new Date("2026-11-15"), [
  "unit-math-1",
]);

function fakeRepositories() {
  const progress = CultivationProgress.initiate(StudentId.fromString("student-1"), "Second");
  const cultivationProgressRepository: CultivationProgressRepository = {
    async findByStudentId() {
      return progress;
    },
    async save() {},
  };
  const curriculumRepository: CurriculumRepository = {
    async findByExamType() {
      return [mathCurriculum];
    },
    async findById(id) {
      return id === mathCurriculum.id ? mathCurriculum : null;
    },
  };
  const learningUnitRepository: LearningUnitRepository = {
    async findById(id) {
      return id === unit1.id ? unit1 : null;
    },
    async findByCurriculumId() {
      return [unit1];
    },
  };
  const upcomingExamRepository: UpcomingExamRepository = {
    async findByExamType() {
      return exam;
    },
  };
  return {
    progress,
    cultivationProgressRepository,
    curriculumRepository,
    learningUnitRepository,
    upcomingExamRepository,
  };
}

describe("GetCultivationOverview", () => {
  it("assembles abilities, units and missions for the UI", async () => {
    const {
      progress,
      cultivationProgressRepository,
      curriculumRepository,
      learningUnitRepository,
      upcomingExamRepository,
    } = fakeRepositories();
    progress.recordAttempt(mathCurriculum, unit1, true);
    const usecase = new GetCultivationOverview(
      cultivationProgressRepository,
      curriculumRepository,
      learningUnitRepository,
      upcomingExamRepository,
    );

    const overview = await usecase.execute(StudentId.fromString("student-1"));

    expect(overview.grade).toBe("Second");
    expect(overview.abilities).toHaveLength(5);
    expect(overview.manaGels).toHaveLength(5);
    expect(overview.manaGels).toContainEqual({ subject: "Math", count: 1 });
    expect(overview.manaGels).toContainEqual({ subject: "English", count: 0 });
    expect(overview.units).toEqual([
      expect.objectContaining({ id: "unit-math-1", subject: "Math", understandingRate: 100 }),
    ]);
    expect(overview.upcomingExam?.id).toBe("exam-1");
    expect(overview.dailyMission).toBeNull();
    expect(overview.mockExamMission).toBeNull();
  });
});
