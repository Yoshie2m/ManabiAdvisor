import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { QuizSession } from "../../domain/models/QuizSession";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { QuizSessionRepository } from "../../domain/repositories/QuizSessionRepository";

export type QuizAnswerResult = { questionId: string; isCorrect: boolean };

export type SyncQuizProgressResult = { session: QuizSession | null };

// クライアント側でまとめて解答した結果（複数問分）を1回のサーバー往復で反映する。
// 1問ごとの往復（旧SubmitQuizAnswer）を避け、通信はテスト完了時・中断時のみに限定する
// （ブラウザが予期せず閉じられた場合、未同期分の進捗は失われる設計で合意済み）。
export class SyncQuizProgress {
  constructor(
    private readonly quizSessionRepository: QuizSessionRepository,
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly learningUnitRepository: LearningUnitRepository,
  ) {}

  async execute(
    studentId: StudentId,
    learningUnitId: string,
    results: QuizAnswerResult[],
    totalQuestions: number,
  ): Promise<SyncQuizProgressResult> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }
    const learningUnit = await this.learningUnitRepository.findById(learningUnitId);
    if (!learningUnit) {
      throw new Error(`LearningUnit not found: ${learningUnitId}`);
    }
    const curriculum = await this.curriculumRepository.findById(learningUnit.curriculumId);
    if (!curriculum) {
      throw new Error(`Curriculum not found: ${learningUnit.curriculumId}`);
    }
    for (const result of results) {
      progress.recordAttempt(curriculum, learningUnit, result.questionId, result.isCorrect);
    }

    let session = await this.quizSessionRepository.find(studentId, learningUnitId);
    if (!session) {
      session = QuizSession.start(studentId, learningUnitId, totalQuestions);
    }
    for (let i = 0; i < results.length; i++) {
      session.advance();
    }

    if (session.isComplete) {
      progress.completeLearningUnit(curriculum, learningUnit);
      await this.cultivationProgressRepository.save(progress);
      await this.quizSessionRepository.delete(studentId, learningUnitId);
      return { session: null };
    }

    await this.cultivationProgressRepository.save(progress);
    await this.quizSessionRepository.save(session);
    return { session };
  }
}
