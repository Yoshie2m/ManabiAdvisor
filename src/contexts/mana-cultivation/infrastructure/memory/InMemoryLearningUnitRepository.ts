import type { LearningUnit } from "../../domain/models/LearningUnit";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";

// 動作確認用のインメモリ実装。DB連携時はFirebase実装に差し替える。
export class InMemoryLearningUnitRepository implements LearningUnitRepository {
  constructor(private readonly units: readonly LearningUnit[]) {}

  async findById(id: string): Promise<LearningUnit | null> {
    return this.units.find((unit) => unit.id === id) ?? null;
  }

  async findByCurriculumId(curriculumId: string): Promise<LearningUnit[]> {
    return this.units.filter((unit) => unit.curriculumId === curriculumId);
  }
}
