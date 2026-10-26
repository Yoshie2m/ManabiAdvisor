import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";
import type { QuizAnswerResult } from "../SyncQuizProgress/SyncQuizProgress";

// 「もう一度この5問を解く」「間違えた問題だけをやり直す」のようなボーナス周回用。
// recordAttempt（理解度記録）のみを行い、QuizSessionの進行（advance）には触れない
// （本来の出題順の進捗とは無関係な、追加の練習という位置づけのため）。
export class RecordQuizAttempts {
  constructor(
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly learningUnitRepository: LearningUnitRepository,
    private readonly curriculumRepository: CurriculumRepository,
  ) {}

  async execute(studentId: StudentId, learningUnitId: string, results: QuizAnswerResult[]): Promise<void> {
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
    await this.cultivationProgressRepository.save(progress);
  }
}
