import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { QuizSession } from "../../domain/models/QuizSession";
import type { QuizSessionRepository } from "../../domain/repositories/QuizSessionRepository";

export class FindQuizSession {
  constructor(private readonly quizSessionRepository: QuizSessionRepository) {}

  async execute(studentId: StudentId, learningUnitId: string): Promise<QuizSession | null> {
    return this.quizSessionRepository.find(studentId, learningUnitId);
  }
}
