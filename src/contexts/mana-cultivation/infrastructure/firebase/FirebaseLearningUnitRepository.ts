import { collection, doc, getDoc, getDocs, query, where, type DocumentData } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import { LearningUnit } from "../../domain/models/LearningUnit";
import type { QuestionType } from "../../domain/models/QuestionType";
import type { LearningUnitRepository } from "../../domain/repositories/LearningUnitRepository";

const COLLECTION = "learningUnits";

type LearningUnitDocument = {
  curriculumId: string;
  title: string;
  difficulty: number;
  questionType: QuestionType | null;
};

function toLearningUnit(id: string, data: DocumentData): LearningUnit {
  const document = data as LearningUnitDocument;
  return LearningUnit.reconstruct({
    id,
    curriculumId: document.curriculumId,
    title: document.title,
    difficulty: document.difficulty,
    questionType: document.questionType ?? undefined,
  });
}

export class FirebaseLearningUnitRepository implements LearningUnitRepository {
  async findById(id: string): Promise<LearningUnit | null> {
    const snapshot = await getDoc(doc(firestore, COLLECTION, id));
    if (!snapshot.exists()) {
      return null;
    }
    return toLearningUnit(snapshot.id, snapshot.data());
  }

  async findByCurriculumId(curriculumId: string): Promise<LearningUnit[]> {
    const snapshot = await getDocs(
      query(collection(firestore, COLLECTION), where("curriculumId", "==", curriculumId)),
    );
    return snapshot.docs.map((document) => toLearningUnit(document.id, document.data()));
  }
}
