import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { QuizSession } from "../../domain/models/QuizSession";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { QuestionRepository } from "../../domain/repositories/QuestionRepository";
import type { QuizSessionRepository } from "../../domain/repositories/QuizSessionRepository";
import { answerCorrectnessPolicy } from "../../domain/specs/AnswerCorrectnessPolicy";

export type SubmitQuizAnswerResult = {
  isCorrect: boolean;
  session: QuizSession;
};

export class SubmitQuizAnswer {
  constructor(
    private readonly quizSessionRepository: QuizSessionRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly learningUnitRepository: LearningUnitRepository,
  ) {}

  async execute(
    studentId: StudentId,
    learningUnitId: string,
    questionId: string,
    submittedAnswer: string,
  ): Promise<SubmitQuizAnswerResult> {
    const questions = await this.questionRepository.findByLearningUnitId(learningUnitId);
    const question = questions.find((candidate) => candidate.id === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    const session = await this.quizSessionRepository.find(studentId, learningUnitId);
    if (!session) {
      throw new Error(`QuizSession not found for learningUnit: ${learningUnitId}`);
    }

    const isCorrect = answerCorrectnessPolicy.isSatisfiedBy(submittedAnswer, question.answer);

    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }
    progress.recordAttempt(learningUnitId, isCorrect);

    session.advance();

    if (session.isComplete) {
      const learningUnit = await this.learningUnitRepository.findById(learningUnitId);
      if (!learningUnit) {
        throw new Error(`LearningUnit not found: ${learningUnitId}`);
      }
      const curriculum = await this.curriculumRepository.findById(learningUnit.curriculumId);
      if (!curriculum) {
        throw new Error(`Curriculum not found: ${learningUnit.curriculumId}`);
      }
      progress.completeLearningUnit(curriculum, learningUnit);
      await this.cultivationProgressRepository.save(progress);
      await this.quizSessionRepository.delete(studentId, learningUnitId);
    } else {
      await this.cultivationProgressRepository.save(progress);
      await this.quizSessionRepository.save(session);
    }

    return { isCorrect, session };
  }
}
