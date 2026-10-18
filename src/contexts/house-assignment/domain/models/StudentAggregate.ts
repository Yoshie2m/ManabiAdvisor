import { houseAssignmentSpecifications } from "../specs/HouseAssignmentSpecification";
import type { House } from "./House";
import type { ManaQuality } from "./ManaQuality";
import { Student } from "./Student";
import type { StudentId } from "./StudentId";

export class StudentAggregate {
  private constructor(private readonly student: Student) {}

  static create(id: StudentId, manaQuality: ManaQuality): StudentAggregate {
    return new StudentAggregate(new Student(id, manaQuality));
  }

  // Trusts persisted invariants instead of re-deriving the house from manaQuality.
  static reconstruct(id: StudentId, manaQuality: ManaQuality, house: House | null): StudentAggregate {
    return new StudentAggregate(new Student(id, manaQuality, house));
  }

  get id(): StudentId {
    return this.student.id;
  }

  get manaQuality(): ManaQuality {
    return this.student.getManaQuality();
  }

  get house(): House | null {
    return this.student.getHouse();
  }

  decideHouse(): House {
    const manaQuality = this.student.getManaQuality();
    const matched = houseAssignmentSpecifications.find((spec) =>
      spec.isSatisfiedBy(manaQuality),
    );
    if (!matched) {
      throw new Error(
        "No house assignment specification matched this student's mana quality",
      );
    }
    this.student.assignTo(matched.house);
    return matched.house;
  }
}
