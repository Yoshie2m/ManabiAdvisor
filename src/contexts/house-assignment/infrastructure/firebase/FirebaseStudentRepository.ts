import { doc, getDoc, setDoc } from "firebase/firestore";

import { firestore } from "@/lib/firebase";

import { isHouse, type House } from "../../domain/models/House";
import { ManaQuality } from "../../domain/models/ManaQuality";
import { StudentAggregate } from "../../domain/models/StudentAggregate";
import type { StudentId } from "../../domain/models/StudentId";
import type { StudentRepository } from "../../domain/repositories/StudentRepository";

const COLLECTION = "students";

type StudentDocument = {
  manaQuality: { order: number; chaos: number; amount: number };
  house: string | null;
};

export class FirebaseStudentRepository implements StudentRepository {
  async findById(id: StudentId): Promise<StudentAggregate | null> {
    const snapshot = await getDoc(doc(firestore, COLLECTION, id.toString()));
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as StudentDocument;
    const manaQuality = ManaQuality.create(data.manaQuality);
    const house: House | null = data.house && isHouse(data.house) ? data.house : null;
    return StudentAggregate.reconstruct(id, manaQuality, house);
  }

  async save(student: StudentAggregate): Promise<void> {
    const data: StudentDocument = {
      manaQuality: {
        order: student.manaQuality.order,
        chaos: student.manaQuality.chaos,
        amount: student.manaQuality.amount,
      },
      house: student.house,
    };
    await setDoc(doc(firestore, COLLECTION, student.id.toString()), data);
  }
}
