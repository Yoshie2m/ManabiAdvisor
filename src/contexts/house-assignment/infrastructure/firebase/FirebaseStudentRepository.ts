import { doc, getDoc, setDoc } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import { isBuddy } from "../../domain/models/Buddy";
import { isHouse } from "../../domain/models/House";
import { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

const COLLECTION = "students";

type StudentDocument = {
  house: string;
  // バディ未選択、または第3回ヒアリング以前のドキュメントでは無い。
  buddy?: string | null;
};

export class FirebaseStudentRepository implements StudentRepository {
  async findById(id: StudentId): Promise<StudentAggregate | null> {
    const snapshot = await getDoc(doc(firestore, COLLECTION, id.toString()));
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as StudentDocument;
    if (!isHouse(data.house)) {
      throw new Error(`Invalid house in students/${id.toString()}: ${data.house}`);
    }
    const buddy = data.buddy ?? null;
    if (buddy !== null && !isBuddy(buddy)) {
      throw new Error(`Invalid buddy in students/${id.toString()}: ${buddy}`);
    }
    return StudentAggregate.create(id, data.house, buddy);
  }

  async save(student: StudentAggregate): Promise<void> {
    const data: StudentDocument = { house: student.house, buddy: student.buddy };
    await setDoc(doc(firestore, COLLECTION, student.id.toString()), data);
  }
}
