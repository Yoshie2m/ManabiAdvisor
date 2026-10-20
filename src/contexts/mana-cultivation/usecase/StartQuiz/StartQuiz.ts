import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { QuizSession } from "../../domain/models/QuizSession";
import type { QuizSessionRepository } from "../../domain/repositories/QuizSessionRepository";

export class StartQuiz {
  constructor(private readonly quizSessionRepository: QuizSessionRepository) {}

  // 既存セッションの有無に関わらず、常にcurrentIndex=0の新しいセッションで上書きする
  // （「最初からやり直す」も同じ呼び出しで表現する）。
  async execute(studentId: StudentId, learningUnitId: string, totalQuestions: number): Promise<QuizSession> {
    const session = QuizSession.start(studentId, learningUnitId, totalQuestions);
    await this.quizSessionRepository.save(session);
    return session;
  }
}
