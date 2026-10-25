import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { CharacterCardRepository } from "../../domain/repositories/CharacterCardRepository";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

export class ExchangeGelsForCard {
  constructor(
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly characterCardRepository: CharacterCardRepository,
  ) {}

  async execute(studentId: StudentId, cardId: string): Promise<void> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }
    const card = await this.characterCardRepository.findById(cardId);
    if (!card) {
      throw new Error(`CharacterCard not found: ${cardId}`);
    }
    progress.exchangeForCard(card);
    await this.cultivationProgressRepository.save(progress);
  }
}
