import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { QuizSession } from "../models/QuizSession";

export interface QuizSessionRepository {
  find(studentId: StudentId, learningUnitId: string): Promise<QuizSession | null>;
  save(session: QuizSession): Promise<void>;
  delete(studentId: StudentId, learningUnitId: string): Promise<void>;
}
