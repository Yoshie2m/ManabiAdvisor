import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import type { QuizAnswerResult } from "../SyncQuizProgress/SyncQuizProgress";

// 「もう一度この5問を解く」「間違えた問題だけをやり直す」のようなボーナス周回用。
// recordAttempt（理解度記録）のみを行い、QuizSessionの進行（advance）には触れない
// （本来の出題順の進捗とは無関係な、追加の練習という位置づけのため）。
export class RecordQuizAttempts {
  constructor(private readonly cultivationProgressRepository: CultivationProgressRepository) {}

  async execute(studentId: StudentId, learningUnitId: string, results: QuizAnswerResult[]): Promise<void> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }
    for (const result of results) {
      progress.recordAttempt(learningUnitId, result.isCorrect);
    }
    await this.cultivationProgressRepository.save(progress);
  }
}
