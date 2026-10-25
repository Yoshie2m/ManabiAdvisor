import type { Buddy } from "../models/Buddy";
import type { BuddyCheer } from "../models/BuddyCheer";

export interface BuddyCheerRepository {
  findByBuddy(buddy: Buddy): Promise<BuddyCheer[]>;
}
