import type { UpcomingExam } from "./UpcomingExam";

export const MISSION_TYPES = ["Daily", "MockExam"] as const;

export type MissionType = (typeof MISSION_TYPES)[number];

export class Mission {
  private constructor(
    readonly id: string,
    readonly type: MissionType,
    readonly targetLearningUnitIds: readonly string[],
  ) {}

  static assignDaily(id: string, focusLearningUnitId: string): Mission {
    return new Mission(id, "Daily", [focusLearningUnitId]);
  }

  static offerMockExam(id: string, upcomingExam: UpcomingExam): Mission {
    return new Mission(id, "MockExam", upcomingExam.targetLearningUnitIds);
  }
}
