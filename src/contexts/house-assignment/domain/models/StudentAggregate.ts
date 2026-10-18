import type { House } from "./House";
import { Student } from "./Student";
import type { StudentId } from "./StudentId";

export class StudentAggregate {
  private constructor(private readonly student: Student) {}

  static create(id: StudentId, house: House): StudentAggregate {
    return new StudentAggregate(new Student(id, house));
  }

  get id(): StudentId {
    return this.student.id;
  }

  get house(): House {
    return this.student.getHouse();
  }
}
