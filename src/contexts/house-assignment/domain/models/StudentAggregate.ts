import type { Buddy } from "./Buddy";
import type { House } from "./House";
import { Student } from "./Student";
import type { StudentId } from "./StudentId";

export class StudentAggregate {
  private constructor(private readonly student: Student) {}

  static create(id: StudentId, house: House, buddy: Buddy | null = null): StudentAggregate {
    return new StudentAggregate(new Student(id, house, buddy));
  }

  get id(): StudentId {
    return this.student.id;
  }

  get house(): House {
    return this.student.getHouse();
  }

  get buddy(): Buddy | null {
    return this.student.getBuddy();
  }

  chooseBuddy(buddy: Buddy): void {
    this.student.chooseBuddy(buddy);
  }
}
