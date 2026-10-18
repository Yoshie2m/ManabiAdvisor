import { collection, doc, getDoc, getDocs, query, where, type DocumentData } from "firebase/firestore";

import { firestore } from "@/lib/firebase";

import { Curriculum } from "../../domain/models/Curriculum";
import type { ExamType } from "../../domain/models/ExamType";
import type { Subject } from "../../domain/models/Subject";
import type { CurriculumRepository } from "../../domain/repositories/CurriculumRepository";

const COLLECTION = "curricula";

type CurriculumDocument = {
  examType: ExamType;
  subject: Subject;
  title: string;
};

function toCurriculum(id: string, data: DocumentData): Curriculum {
  const document = data as CurriculumDocument;
  return Curriculum.reconstruct({
    id,
    examType: document.examType,
    subject: document.subject,
    title: document.title,
  });
}

export class FirebaseCurriculumRepository implements CurriculumRepository {
  async findByExamType(examType: ExamType): Promise<Curriculum[]> {
    const snapshot = await getDocs(query(collection(firestore, COLLECTION), where("examType", "==", examType)));
    return snapshot.docs.map((document) => toCurriculum(document.id, document.data()));
  }

  async findById(id: string): Promise<Curriculum | null> {
    const snapshot = await getDoc(doc(firestore, COLLECTION, id));
    if (!snapshot.exists()) {
      return null;
    }
    return toCurriculum(snapshot.id, snapshot.data());
  }
}
