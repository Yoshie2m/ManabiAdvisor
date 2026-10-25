import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { Subject } from "../../domain/models/Subject";
import type { CharacterCardRepository } from "../../domain/repositories/CharacterCardRepository";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

export type CharacterCardView = {
  id: string;
  number: number;
  name: string;
  furigana: string;
  title: string;
  flavor: string;
  rarity: number;
  attribute: Subject;
  imageUrl: string;
  costSubject: Subject;
  costCount: number;
  ownedGels: number;
  acquired: boolean;
  affordable: boolean;
};

export class GetCharacterCollection {
  constructor(
    private readonly cultivationProgressRepository: CultivationProgressRepository,
    private readonly characterCardRepository: CharacterCardRepository,
  ) {}

  async execute(studentId: StudentId): Promise<CharacterCardView[]> {
    const progress = await this.cultivationProgressRepository.findByStudentId(studentId);
    if (!progress) {
      throw new Error(`CultivationProgress not found for student: ${studentId.toString()}`);
    }
    const cards = await this.characterCardRepository.findAll();
    return [...cards]
      .sort((a, b) => a.number - b.number)
      .map((card) => {
        const acquired = progress.hasAcquiredCard(card.id);
        const ownedGels = progress.getManaGel(card.cost.subject).count;
        return {
          id: card.id,
          number: card.number,
          name: card.name,
          furigana: card.furigana,
          title: card.title,
          flavor: card.flavor,
          rarity: card.rarity,
          attribute: card.attribute,
          imageUrl: card.imageUrl,
          costSubject: card.cost.subject,
          costCount: card.cost.count,
          ownedGels,
          acquired,
          affordable: !acquired && ownedGels >= card.cost.count,
        };
      });
  }
}
