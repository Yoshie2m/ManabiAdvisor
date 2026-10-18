import type { Subject } from "./Subject";

export class SubjectAbility {
  private constructor(
    readonly subject: Subject,
    readonly level: number,
  ) {}

  static initial(subject: Subject): SubjectAbility {
    return new SubjectAbility(subject, 0);
  }

  static create(subject: Subject, level: number): SubjectAbility {
    if (level < 0 || level > 100) {
      throw new Error("SubjectAbility.level must be between 0 and 100");
    }
    return new SubjectAbility(subject, level);
  }

  increase(amount: number): SubjectAbility {
    if (amount <= 0) {
      throw new Error("SubjectAbility.increase amount must be positive");
    }
    return SubjectAbility.create(this.subject, Math.min(100, this.level + amount));
  }
}
