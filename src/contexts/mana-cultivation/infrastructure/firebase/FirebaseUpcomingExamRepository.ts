import { collection, getDocs, query, where, type Timestamp } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import type { ExamType } from "../../domain/models/ExamType";
import { UpcomingExam } from "../../domain/models/UpcomingExam";
import type { UpcomingExamRepository } from "../../domain/repositories/UpcomingExamRepository";

const COLLECTION = "upcomingExams";

type UpcomingExamDocument = {
  title: string;
  examType: ExamType;
  scheduledDate: Timestamp;
  targetLearningUnitIds: string[];
};

// 予定ごとに upcomingExams/{id}。1つの examType に複数の予定を持てる（第21回ヒアリング）。
export class FirebaseUpcomingExamRepository implements UpcomingExamRepository {
  async findAllByExamType(examType: ExamType): Promise<UpcomingExam[]> {
    const snapshot = await getDocs(query(collection(firestore, COLLECTION), where("examType", "==", examType)));
    return snapshot.docs.map((document) => {
      const data = document.data() as UpcomingExamDocument;
      return UpcomingExam.create({
        id: document.id,
        title: data.title,
        examType: data.examType,
        scheduledDate: data.scheduledDate.toDate(),
        targetLearningUnitIds: data.targetLearningUnitIds,
      });
    });
  }
}
