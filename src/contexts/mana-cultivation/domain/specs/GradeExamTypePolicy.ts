import type { ExamType } from "../models/ExamType";
import type { Grade } from "../models/Grade";

export interface GradeExamTypePolicy {
  availableExamTypesFor(grade: Grade): readonly ExamType[];
}

// 学年段階ごとの「定期テスト系」ExamType。未対応の学年（中1・中3・高1〜3）はまだ
// ExamType/カリキュラムが無いため、英検のみが共通で選べる。
const REGULAR_EXAM_TYPE_BY_GRADE: Partial<Record<Grade, ExamType>> = {
  Pre: "Elementary6thYearEntranceExam",
  Second: "JuniorHigh2ndYearRegularExam",
};

export const LAUNCHED_GRADES: readonly Grade[] = Object.keys(
  REGULAR_EXAM_TYPE_BY_GRADE,
) as Grade[];

export const gradeExamTypePolicy: GradeExamTypePolicy = {
  availableExamTypesFor: (grade) => {
    const regularExamType = REGULAR_EXAM_TYPE_BY_GRADE[grade];
    return regularExamType ? [regularExamType, "Eiken"] : ["Eiken"];
  },
};
