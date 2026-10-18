import type { House } from "../../domain/models/House";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

export class AssignHouse {
  constructor(private readonly studentRepository: StudentRepository) {}

  async execute(studentId: StudentId): Promise<House> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error(`Student not found: ${studentId.toString()}`);
    }

    const house = student.decideHouse();
    await this.studentRepository.save(student);
    return house;
  }
}
