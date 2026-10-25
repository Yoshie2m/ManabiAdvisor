import type { Subject } from "./Subject";

// 勉強をこなすと貯まる、科目ごとのポイント。上限は無い（SubjectAbilityの0〜100とは別物）。
export class ManaGel {
  private constructor(
    readonly subject: Subject,
    readonly count: number,
  ) {}

  static none(subject: Subject): ManaGel {
    return new ManaGel(subject, 0);
  }

  static create(subject: Subject, count: number): ManaGel {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error("ManaGel.count must be a non-negative integer");
    }
    return new ManaGel(subject, count);
  }

  add(amount: number): ManaGel {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new Error("ManaGel.add amount must be a positive integer");
    }
    return new ManaGel(this.subject, this.count + amount);
  }

  spend(amount: number): ManaGel {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new Error("ManaGel.spend amount must be a positive integer");
    }
    if (amount > this.count) {
      throw new Error(`Not enough ${this.subject} gels: need ${amount}, have ${this.count}`);
    }
    return new ManaGel(this.subject, this.count - amount);
  }
}
