import { doc, getDoc, setDoc } from "firebase/firestore";

import { firestore } from "@/lib/firebase";

import { isHouse } from "../../domain/models/House";
import { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

const COLLECTION = "students";

type StudentDocument = {
  house: string;
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
    return StudentAggregate.create(id, data.house);
  }

  async save(student: StudentAggregate): Promise<void> {
    const data: StudentDocument = { house: student.house };
    await setDoc(doc(firestore, COLLECTION, student.id.toString()), data);
  }
}
