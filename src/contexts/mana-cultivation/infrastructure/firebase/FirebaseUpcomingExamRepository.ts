import { doc, getDoc, Timestamp } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import type { ExamType } from "../../domain/models/ExamType";
import { UpcomingExam } from "../../domain/models/UpcomingExam";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";

const COLLECTION = "upcomingExams";

type UpcomingExamDocument = {
  id: string;
  examType: ExamType;
  scheduledDate: Timestamp;
  targetLearningUnitIds: string[];
};

// Keyed by examType itself: this repository's contract allows at most one
// upcoming exam per exam type at a time.
export class FirebaseUpcomingExamRepository implements UpcomingExamRepository {
  async findByExamType(examType: ExamType): Promise<UpcomingExam | null> {
    const snapshot = await getDoc(doc(firestore, COLLECTION, examType));
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as UpcomingExamDocument;
    return new UpcomingExam(data.id, data.examType, data.scheduledDate.toDate(), data.targetLearningUnitIds);
  }
}
