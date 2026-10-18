import type { House } from "./House";
import type { ManaQuality } from "./ManaQuality";
import type { StudentId } from "./StudentId";

export class Student {
  constructor(
    readonly id: StudentId,
    private manaQuality: ManaQuality,
    private house: House | null = null,
  ) {}

  getManaQuality(): ManaQuality {
    return this.manaQuality;
  }

  getHouse(): House | null {
    return this.house;
  }

  assignTo(house: House): void {
    this.house = house;
  }
}
