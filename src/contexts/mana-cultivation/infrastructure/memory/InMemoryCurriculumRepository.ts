import type { Curriculum } from "../../domain/models/Curriculum";
import type { ExamType } from "../../domain/models/ExamType";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";

// 動作確認用のインメモリ実装。DB連携時は FirebaseCurriculumRepository に差し替える。
export class InMemoryCurriculumRepository implements CurriculumRepository {
  constructor(private readonly curricula: readonly Curriculum[]) {}

  async findByExamType(examType: ExamType): Promise<Curriculum[]> {
    return this.curricula.filter((curriculum) => curriculum.examType === examType);
  }

  async findById(id: string): Promise<Curriculum | null> {
    return this.curricula.find((curriculum) => curriculum.id === id) ?? null;
  }
}
