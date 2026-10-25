import type { Subject } from "./Subject";

// カードの交換に必要な、ある科目のジェルの個数。
export class GelCost {
  private constructor(
    readonly subject: Subject,
    readonly count: number,
  ) {}

  static create(subject: Subject, count: number): GelCost {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error("GelCost.count must be a positive integer");
    }
    return new GelCost(subject, count);
  }
}
