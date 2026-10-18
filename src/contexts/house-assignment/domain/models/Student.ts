import type { House } from "./House";
import type { StudentId } from "./StudentId";

export class Student {
  constructor(
    readonly id: StudentId,
    private readonly house: House,
  ) {}

  getHouse(): House {
    return this.house;
  }
}
