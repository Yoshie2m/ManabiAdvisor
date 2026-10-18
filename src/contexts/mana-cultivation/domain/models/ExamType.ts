export const EXAM_TYPES = [
  "JuniorHigh2ndYearRegularExam",
  "Eiken",
  "Elementary6thYearEntranceExam",
] as const;

export type ExamType = (typeof EXAM_TYPES)[number];
