import type { Buddy } from "./Buddy";
import type { House } from "./House";
import type { StudentId } from "./StudentId";

export class Student {
  constructor(
    readonly id: StudentId,
    private readonly house: House,
    private buddy: Buddy | null = null,
  ) {}

  getHouse(): House {
    return this.house;
  }

  getBuddy(): Buddy | null {
    return this.buddy;
  }

  chooseBuddy(buddy: Buddy): void {
    this.buddy = buddy;
  }
}
