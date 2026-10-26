import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { Curriculum } from "../../domain/models/Curriculum";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { LearningUnit } from "../../domain/models/LearningUnit";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import { RecordQuizAttempts } from "./RecordQuizAttempts";

const curriculum = Curriculum.create({
  id: "curriculum-japanese",
  examType: "JuniorHigh2ndYearRegularExam",
  subject: "Japanese",
  title: "中2国語",
});
const unit = LearningUnit.create(
  {
    id: "unit-kanji-write",
    curriculumId: "curriculum-japanese",
    title: "漢字小テストI（書き）",
    difficulty: 3,
    questionType: "KanjiWriting",
  },
  "Japanese",
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
  return new RecordQuizAttempts(
    repositories.cultivationProgressRepository,
    repositories.learningUnitRepository,
    repositories.curriculumRepository,
  );
}

describe("RecordQuizAttempts", () => {
  it("records every result and adds a gel of the unit's subject per correct answer", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));

    await usecaseFor(repositories).execute(studentId, unit.id, [
      { questionId: "q-1", isCorrect: true },
      { questionId: "q-2", isCorrect: false },
      { questionId: "q-3", isCorrect: true },
    ]);

    const progress = repositories.progresses.get("student-1");
    expect(progress?.getUnderstanding(unit.id).totalCount).toBe(3);
    expect(progress?.getUnderstanding(unit.id).correctCount).toBe(2);
    expect(progress?.getManaGel("Japanese").count).toBe(2);
    expect(progress?.getMissedQuestionIds(unit.id)).toEqual(["q-2"]);
  });

  it("throws when the student has not started cultivation yet", async () => {
    const repositories = fakeRepositories();

    await expect(
      usecaseFor(repositories).execute(StudentId.fromString("student-1"), unit.id, [{ questionId: "q-4", isCorrect: true }]),
    ).rejects.toThrow();
  });

  it("throws when the learning unit does not exist", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));

    await expect(usecaseFor(repositories).execute(studentId, "unit-missing", [{ questionId: "q-5", isCorrect: true }])).rejects.toThrow();
  });
});
