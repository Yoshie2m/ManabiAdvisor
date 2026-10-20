import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { QuizSession } from "../../domain/models/QuizSession";
import type { QuizSessionRepository } from "../../domain/repositories/QuizSessionRepository";

const COLLECTION = "quizSessions";
const SUBCOLLECTION = "units";

type QuizSessionDocument = {
  totalQuestions: number;
  currentIndex: number;
};

function sessionDoc(studentId: StudentId, learningUnitId: string) {
  return doc(firestore, COLLECTION, studentId.toString(), SUBCOLLECTION, learningUnitId);
}

export class FirebaseQuizSessionRepository implements QuizSessionRepository {
  async find(studentId: StudentId, learningUnitId: string): Promise<QuizSession | null> {
    const snapshot = await getDoc(sessionDoc(studentId, learningUnitId));
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as QuizSessionDocument;
    return QuizSession.reconstruct({
      studentId,
      learningUnitId,
      totalQuestions: data.totalQuestions,
      currentIndex: data.currentIndex,
    });
  }

  async save(session: QuizSession): Promise<void> {
    const data: QuizSessionDocument = {
      totalQuestions: session.totalQuestions,
      currentIndex: session.currentIndex,
    };
    await setDoc(sessionDoc(session.studentId, session.learningUnitId), data);
  }

  async delete(studentId: StudentId, learningUnitId: string): Promise<void> {
    await deleteDoc(sessionDoc(studentId, learningUnitId));
  }
}
