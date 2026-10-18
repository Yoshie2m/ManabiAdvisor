import type { Curriculum } from "../../domain/models/Curriculum";
import type { ExamType } from "../../domain/models/ExamType";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";

// Pending the Firestore schema for curricula/learningUnits; wire up a real client here.
export class FirebaseCurriculumRepository implements CurriculumRepository {
  async findByExamType(_examType: ExamType): Promise<Curriculum[]> {
    throw new Error("FirebaseCurriculumRepository.findByExamType is not implemented yet");
  }

  async findById(_id: string): Promise<Curriculum | null> {
    throw new Error("FirebaseCurriculumRepository.findById is not implemented yet");
  }
}
