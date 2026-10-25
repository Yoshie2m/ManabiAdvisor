import type { Buddy } from "./Buddy";

export type BuddyCheerProps = { id: string; buddy: Buddy; order: number; message: string };

// バディが大広間で出す応援フレーズ。orderは日替わりで出す順番（0始まり）。
export class BuddyCheer {
  private constructor(
    readonly id: string,
    readonly buddy: Buddy,
    readonly order: number,
    readonly message: string,
  ) {}

  static create({ id, buddy, order, message }: BuddyCheerProps): BuddyCheer {
    if (message.trim().length === 0) {
      throw new Error("BuddyCheer.message must not be empty");
    }
    if (!Number.isInteger(order) || order < 0) {
      throw new Error("BuddyCheer.order must be a non-negative integer");
    }
    return new BuddyCheer(id, buddy, order, message);
  }
}
