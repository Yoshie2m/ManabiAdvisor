import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { Curriculum } from "../../domain/models/Curriculum";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { LearningUnit } from "../../domain/models/LearningUnit";
import { QuizSession } from "../../domain/models/QuizSession";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { QuizSessionRepository } from "../../domain/repositories/QuizSessionRepository";
import { SyncQuizProgress } from "./SyncQuizProgress";

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
  const sessions = new Map<string, QuizSession>();

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
  const quizSessionRepository: QuizSessionRepository = {
    async find(studentId, learningUnitId) {
      return sessions.get(`${studentId.toString()}:${learningUnitId}`) ?? null;
    },
    async save(session) {
      sessions.set(`${session.studentId.toString()}:${session.learningUnitId}`, session);
    },
    async delete(studentId, learningUnitId) {
      sessions.delete(`${studentId.toString()}:${learningUnitId}`);
    },
  };

  return { progresses, sessions, cultivationProgressRepository, curriculumRepository, learningUnitRepository, quizSessionRepository };
}

describe("SyncQuizProgress", () => {
  it("records every result and saves a new session when not yet complete", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new SyncQuizProgress(
      repositories.quizSessionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    const result = await usecase.execute(
      studentId,
      unit.id,
      [{ isCorrect: true }, { isCorrect: false }, { isCorrect: true }],
      5,
    );

    expect(result.session?.currentIndex).toBe(3);
    expect(result.session?.isComplete).toBe(false);
    const understanding = repositories.progresses.get("student-1")?.getUnderstanding(unit.id);
    expect(understanding?.totalCount).toBe(3);
    expect(understanding?.correctCount).toBe(2);
    expect(repositories.progresses.get("student-1")?.getManaGel("Japanese").count).toBe(2);
    expect(repositories.sessions.get(`student-1:${unit.id}`)?.currentIndex).toBe(3);
  });

  it("continues from an existing session instead of restarting at 0", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    repositories.sessions.set(
      `${studentId.toString()}:${unit.id}`,
      QuizSession.reconstruct({ studentId, learningUnitId: unit.id, totalQuestions: 5, currentIndex: 2 }),
    );
    const usecase = new SyncQuizProgress(
      repositories.quizSessionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    const result = await usecase.execute(studentId, unit.id, [{ isCorrect: true }], 5);

    expect(result.session?.currentIndex).toBe(3);
  });

  it("completes the unit and deletes the session once all questions are synced", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));

    const usecase = new SyncQuizProgress(
      repositories.quizSessionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    const result = await usecase.execute(
      studentId,
      unit.id,
      [{ isCorrect: true }, { isCorrect: true }],
      2,
    );

    expect(result.session).toBeNull();
    expect(repositories.progresses.get("student-1")?.getAbility("Japanese").level).toBe(5);
    expect(repositories.sessions.get(`student-1:${unit.id}`)).toBeUndefined();
  });

  it("throws when the student has not started cultivation yet", async () => {
    const repositories = fakeRepositories();
    const usecase = new SyncQuizProgress(
      repositories.quizSessionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    await expect(
      usecase.execute(StudentId.fromString("student-1"), unit.id, [{ isCorrect: true }], 5),
    ).rejects.toThrow();
  });
});
