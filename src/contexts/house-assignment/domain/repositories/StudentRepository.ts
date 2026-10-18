import type { StudentAggregate } from "../models/StudentAggregate";
import type { StudentId } from "../models/StudentId";

export interface StudentRepository {
  findById(id: StudentId): Promise<StudentAggregate | null>;
  save(student: StudentAggregate): Promise<void>;
}
