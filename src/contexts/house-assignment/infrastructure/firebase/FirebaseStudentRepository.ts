import type { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

// Pending the Firestore schema for students/manaQualities; wire up a real client here.
export class FirebaseStudentRepository implements StudentRepository {
  async findById(_id: StudentId): Promise<StudentAggregate | null> {
    throw new Error("FirebaseStudentRepository.findById is not implemented yet");
  }

  async save(_student: StudentAggregate): Promise<void> {
    throw new Error("FirebaseStudentRepository.save is not implemented yet");
  }
}
