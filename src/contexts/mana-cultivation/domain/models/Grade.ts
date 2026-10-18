// 中1〜高3を貫く7段階の学年進行。プレ期間(小6)から始まり、シックスグレード(高3)の先に
// 大学受験という最終ゴールがある(今回は大学受験自体のモデリングは対象外)。
export const GRADES = ["Pre", "First", "Second", "Third", "Fourth", "Fifth", "Sixth"] as const;

export type Grade = (typeof GRADES)[number];

export function isGrade(value: string): value is Grade {
  return (GRADES as readonly string[]).includes(value);
}
