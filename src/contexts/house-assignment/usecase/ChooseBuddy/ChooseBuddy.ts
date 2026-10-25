import type { Buddy } from "../../domain/models/Buddy";
import type { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

export class ChooseBuddy {
  constructor(private readonly studentRepository: StudentRepository) {}

  async execute(studentId: StudentId, buddy: Buddy): Promise<StudentAggregate> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error(`Student not found: ${studentId.toString()}`);
    }
    student.chooseBuddy(buddy);
    await this.studentRepository.save(student);
    return student;
  }
}
