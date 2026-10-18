import type { ManaQuality } from "../../domain/models/ManaQuality";
import { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

export class EnrollStudent {
  constructor(private readonly studentRepository: StudentRepository) {}

  async execute(studentId: StudentId, manaQuality: ManaQuality): Promise<StudentAggregate> {
    const aggregate = StudentAggregate.create(studentId, manaQuality);
    await this.studentRepository.save(aggregate);
    return aggregate;
  }
}
