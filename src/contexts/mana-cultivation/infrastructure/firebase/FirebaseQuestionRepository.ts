import { collection, getDocs, query, where, type DocumentData } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import { Question } from "../../domain/models/Question";
import type { QuestionRepository } from "../../domain/repositories/QuestionRepository";

const COLLECTION = "questions";

type QuestionDocument = {
  learningUnitId: string;
  prompt: string;
  answer: string;
  explanation?: string | null;
  imageUrl?: string | null;
};

function toQuestion(id: string, data: DocumentData): Question {
  const document = data as QuestionDocument;
  return Question.reconstruct({
    id,
    learningUnitId: document.learningUnitId,
    prompt: document.prompt,
    answer: document.answer,
    explanation: document.explanation ?? undefined,
    imageUrl: document.imageUrl ?? undefined,
  });
}

export class FirebaseQuestionRepository implements QuestionRepository {
  async findByLearningUnitId(learningUnitId: string): Promise<Question[]> {
    const snapshot = await getDocs(
      query(collection(firestore, COLLECTION), where("learningUnitId", "==", learningUnitId)),
    );
    return snapshot.docs.map((document) => toQuestion(document.id, document.data()));
  }
}
