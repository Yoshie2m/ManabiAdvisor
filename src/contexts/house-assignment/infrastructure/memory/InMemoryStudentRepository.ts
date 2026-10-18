import type { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

// 動作確認用のインメモリ実装。DB連携時は FirebaseStudentRepository に差し替える。
export class InMemoryStudentRepository implements StudentRepository {
  private readonly students = new Map<string, StudentAggregate>();

  async findById(id: StudentId): Promise<StudentAggregate | null> {
    return this.students.get(id.toString()) ?? null;
  }

  async save(student: StudentAggregate): Promise<void> {
    this.students.set(student.id.toString(), student);
  }
}
