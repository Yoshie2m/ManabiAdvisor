import type { House } from "../../domain/models/House";
import { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

export class EnrollStudent {
  constructor(private readonly studentRepository: StudentRepository) {}

  async execute(studentId: StudentId, house: House): Promise<StudentAggregate> {
    const aggregate = StudentAggregate.create(studentId, house);
    await this.studentRepository.save(aggregate);
    return aggregate;
  }
}
