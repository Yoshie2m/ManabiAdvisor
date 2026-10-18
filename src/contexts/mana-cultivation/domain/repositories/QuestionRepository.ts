import type { Question } from "../models/Question";

export interface QuestionRepository {
  findByLearningUnitId(learningUnitId: string): Promise<Question[]>;
}
