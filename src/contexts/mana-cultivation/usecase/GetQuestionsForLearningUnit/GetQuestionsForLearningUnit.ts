import type { Question } from "../../domain/models/Question";
import type { QuestionRepository } from "../../domain/repositories/QuestionRepository";

export class GetQuestionsForLearningUnit {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(learningUnitId: string): Promise<Question[]> {
    return this.questionRepository.findByLearningUnitId(learningUnitId);
  }
}
