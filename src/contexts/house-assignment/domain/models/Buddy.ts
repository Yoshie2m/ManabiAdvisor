export const BUDDIES = ["Amou", "Kageshima"] as const;

export type Buddy = (typeof BUDDIES)[number];

export function isBuddy(value: string): value is Buddy {
  return (BUDDIES as readonly string[]).includes(value);
}
