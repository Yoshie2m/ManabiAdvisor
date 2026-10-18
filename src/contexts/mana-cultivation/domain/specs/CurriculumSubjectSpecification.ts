import type { ExamType } from "../models/ExamType";
import type { Subject } from "../models/Subject";

export interface CurriculumSubjectSpecification {
  isSatisfiedBy(examType: ExamType, subject: Subject): boolean;
}

const SUBJECTS_BY_EXAM_TYPE: Record<ExamType, readonly Subject[]> = {
  JuniorHigh2ndYearRegularExam: ["English", "Math", "Japanese", "Science", "SocialStudies"],
  Eiken: ["English"],
  Elementary6thYearEntranceExam: ["Japanese", "Math", "Science", "SocialStudies"],
};

export const curriculumSubjectSpecification: CurriculumSubjectSpecification = {
  isSatisfiedBy: (examType, subject) => SUBJECTS_BY_EXAM_TYPE[examType].includes(subject),
};
