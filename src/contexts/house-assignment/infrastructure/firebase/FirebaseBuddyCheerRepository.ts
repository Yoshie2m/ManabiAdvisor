import { collection, getDocs, query, where } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import type { Buddy } from "../../domain/models/Buddy";
import { BuddyCheer } from "../../domain/models/BuddyCheer";
import type { BuddyCheerRepository } from "../../domain/repositories/BuddyCheerRepository";

const COLLECTION = "buddyCheers";

type BuddyCheerDocument = {
  buddy: Buddy;
  order: number;
  message: string;
};

export class FirebaseBuddyCheerRepository implements BuddyCheerRepository {
  async findByBuddy(buddy: Buddy): Promise<BuddyCheer[]> {
    const snapshot = await getDocs(query(collection(firestore, COLLECTION), where("buddy", "==", buddy)));
    return snapshot.docs.map((document) => {
      const data = document.data() as BuddyCheerDocument;
      return BuddyCheer.create({ id: document.id, buddy: data.buddy, order: data.order, message: data.message });
    });
  }
}
