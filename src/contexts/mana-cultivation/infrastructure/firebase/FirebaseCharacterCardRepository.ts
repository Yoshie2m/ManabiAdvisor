import { collection, doc, getDoc, getDocs, type DocumentData } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import { CharacterCard } from "../../domain/models/CharacterCard";
import { GelCost } from "../../domain/models/GelCost";
import type { Subject } from "../../domain/models/Subject";
import type { CharacterCardRepository } from "../../domain/repositories/CharacterCardRepository";

const COLLECTION = "characterCards";

type CharacterCardDocument = {
  number: number;
  name: string;
  furigana: string;
  title: string;
  flavor: string;
  rarity: number;
  attribute: Subject;
  imageUrl: string;
  costSubject: Subject;
  costCount: number;
};

function toCard(id: string, data: DocumentData): CharacterCard {
  const document = data as CharacterCardDocument;
  return CharacterCard.create({
    id,
    number: document.number,
    name: document.name,
    furigana: document.furigana,
    title: document.title,
    flavor: document.flavor,
    rarity: document.rarity,
    attribute: document.attribute,
    imageUrl: document.imageUrl,
    cost: GelCost.create(document.costSubject, document.costCount),
  });
}

export class FirebaseCharacterCardRepository implements CharacterCardRepository {
  async findAll(): Promise<CharacterCard[]> {
    const snapshot = await getDocs(collection(firestore, COLLECTION));
    return snapshot.docs.map((document) => toCard(document.id, document.data()));
  }

  async findById(id: string): Promise<CharacterCard | null> {
    const snapshot = await getDoc(doc(firestore, COLLECTION, id));
    return snapshot.exists() ? toCard(snapshot.id, snapshot.data()) : null;
  }
}
