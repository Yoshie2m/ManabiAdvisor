export type ManaQualityProps = {
  order: number;
  chaos: number;
  amount: number;
};

export class ManaQuality {
  private constructor(
    readonly order: number,
    readonly chaos: number,
    readonly amount: number,
  ) {}

  static create({ order, chaos, amount }: ManaQualityProps): ManaQuality {
    for (const [name, value] of Object.entries({ order, chaos, amount })) {
      if (value < 0 || value > 100) {
        throw new Error(`ManaQuality.${name} must be between 0 and 100`);
      }
    }
    return new ManaQuality(order, chaos, amount);
  }
}
