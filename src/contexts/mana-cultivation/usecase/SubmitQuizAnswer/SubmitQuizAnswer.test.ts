import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { Curriculum } from "../../domain/models/Curriculum";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { LearningUnit } from "../../domain/models/LearningUnit";
import { Question } from "../../domain/models/Question";
import { QuizSession } from "../../domain/models/QuizSession";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { QuestionRepository } from "../../domain/repositories/QuestionRepository";
import type { QuizSessionRepository } from "../../domain/repositories/QuizSessionRepository";
import { SubmitQuizAnswer } from "./SubmitQuizAnswer";

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
const questions = [
  Question.create({ id: "q-1", learningUnitId: unit.id, prompt: "人生のヒアイを見る。", answer: "悲哀" }),
  Question.create({ id: "q-2", learningUnitId: unit.id, prompt: "問題2", answer: "答え2" }),
];

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
  const questionRepository: QuestionRepository = {
    async findByLearningUnitId() {
      return questions;
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

  return {
    progresses,
    sessions,
    cultivationProgressRepository,
    curriculumRepository,
    learningUnitRepository,
    questionRepository,
    quizSessionRepository,
  };
}

describe("SubmitQuizAnswer", () => {
  it("records the attempt, advances the session, and autosaves when not yet complete", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    repositories.sessions.set(`${studentId.toString()}:${unit.id}`, QuizSession.start(studentId, unit.id, 2));
    const usecase = new SubmitQuizAnswer(
      repositories.quizSessionRepository,
      repositories.questionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    const result = await usecase.execute(studentId, unit.id, "q-1", "悲哀");

    expect(result.isCorrect).toBe(true);
    expect(result.session.currentIndex).toBe(1);
    expect(result.session.isComplete).toBe(false);
    expect(repositories.progresses.get("student-1")?.getUnderstanding(unit.id).correctCount).toBe(1);
    expect(repositories.sessions.get(`student-1:${unit.id}`)?.currentIndex).toBe(1);
  });

  it("reports an incorrect answer without throwing", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    repositories.sessions.set(`${studentId.toString()}:${unit.id}`, QuizSession.start(studentId, unit.id, 2));
    const usecase = new SubmitQuizAnswer(
      repositories.quizSessionRepository,
      repositories.questionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    const result = await usecase.execute(studentId, unit.id, "q-1", "悲愛");

    expect(result.isCorrect).toBe(false);
    expect(repositories.progresses.get("student-1")?.getUnderstanding(unit.id).totalCount).toBe(1);
    expect(repositories.progresses.get("student-1")?.getUnderstanding(unit.id).correctCount).toBe(0);
  });

  it("grows the subject ability and resets (deletes) the session once the last question is answered", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    repositories.sessions.set(`${studentId.toString()}:${unit.id}`, QuizSession.reconstruct({
      studentId,
      learningUnitId: unit.id,
      totalQuestions: 2,
      currentIndex: 1,
    }));
    const usecase = new SubmitQuizAnswer(
      repositories.quizSessionRepository,
      repositories.questionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    const result = await usecase.execute(studentId, unit.id, "q-2", "答え2");

    expect(result.session.isComplete).toBe(true);
    expect(repositories.progresses.get("student-1")?.getAbility("Japanese").level).toBe(5);
    expect(repositories.sessions.get(`student-1:${unit.id}`)).toBeUndefined();
  });

  it("throws when the question does not belong to the given learning unit", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    repositories.sessions.set(`${studentId.toString()}:${unit.id}`, QuizSession.start(studentId, unit.id, 2));
    const usecase = new SubmitQuizAnswer(
      repositories.quizSessionRepository,
      repositories.questionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    await expect(usecase.execute(studentId, unit.id, "missing-question", "悲哀")).rejects.toThrow();
  });

  it("throws when there is no active session (StartQuiz must be called first)", async () => {
    const repositories = fakeRepositories();
    const studentId = StudentId.fromString("student-1");
    repositories.progresses.set(studentId.toString(), CultivationProgress.initiate(studentId, "Second"));
    const usecase = new SubmitQuizAnswer(
      repositories.quizSessionRepository,
      repositories.questionRepository,
      repositories.cultivationProgressRepository,
      repositories.curriculumRepository,
      repositories.learningUnitRepository,
    );

    await expect(usecase.execute(studentId, unit.id, "q-1", "悲哀")).rejects.toThrow();
  });
});
