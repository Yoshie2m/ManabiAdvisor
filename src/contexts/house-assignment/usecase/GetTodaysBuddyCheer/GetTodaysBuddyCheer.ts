import type { Buddy } from "../../domain/models/Buddy";
import type { BuddyCheer } from "../../domain/models/BuddyCheer";
import type { BuddyCheerRepository } from "../../domain/repositories/BuddyCheerRepository";
import { dailyCheerPolicy } from "../../domain/specs/DailyCheerPolicy";

export class GetTodaysBuddyCheer {
  constructor(private readonly buddyCheerRepository: BuddyCheerRepository) {}

  async execute(buddy: Buddy, today: Date): Promise<BuddyCheer | null> {
    const cheers = await this.buddyCheerRepository.findByBuddy(buddy);
    return dailyCheerPolicy.select(cheers, today);
  }
}
