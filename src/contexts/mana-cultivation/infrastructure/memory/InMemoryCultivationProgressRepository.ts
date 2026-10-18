import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import type { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

// 動作確認用のインメモリ実装。DB連携時はFirebase実装に差し替える。
export class InMemoryCultivationProgressRepository implements CultivationProgressRepository {
  private readonly progresses = new Map<string, CultivationProgress>();

  async findByStudentId(studentId: StudentId): Promise<CultivationProgress | null> {
    return this.progresses.get(studentId.toString()) ?? null;
  }

  async save(progress: CultivationProgress): Promise<void> {
    this.progresses.set(progress.studentId.toString(), progress);
  }
}
