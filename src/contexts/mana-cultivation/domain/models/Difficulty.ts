export const DIFFICULTIES = [1, 2, 3, 4, 5] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export function isDifficulty(value: number): value is Difficulty {
  return (DIFFICULTIES as readonly number[]).includes(value);
}
