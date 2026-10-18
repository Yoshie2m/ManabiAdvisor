export const HOUSES = ["RegiusCardis", "RoseSleep"] as const;

export type House = (typeof HOUSES)[number];

export function isHouse(value: string): value is House {
  return (HOUSES as readonly string[]).includes(value);
}
