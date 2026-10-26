import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CharacterCard } from "../../domain/models/CharacterCard";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import { GelCost } from "../../domain/models/GelCost";
import { ManaGel } from "../../domain/models/ManaGel";
import { SUBJECTS } from "../../domain/models/Subject";
import { SubjectAbility } from "../../domain/models/SubjectAbility";
import type { CharacterCardRepository } from "../../domain/repositories/CharacterCardRepository";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";
import { GetCharacterCollection } from "./GetCharacterCollection";

function cardOf(id: string, number: number, subject: "Math" | "English") {
  return CharacterCard.create({
    id,
    number,
    name: id,
    furigana: id,
    title: "肩書き",
    flavor: "セリフ",
    rarity: 3,
    attribute: subject,
    imageUrl: `/images/${id}.png`,
    cost: GelCost.create(subject, 30),
  });
}

describe("GetCharacterCollection", () => {
  it("lists every card by number with acquired and affordable flags", async () => {
    const studentId = StudentId.fromString("student-1");
    const progress = CultivationProgress.reconstruct({
      studentId,
      grade: "Second",
      abilities: new Map(SUBJECTS.map((subject) => [subject, SubjectAbility.initial(subject)])),
      understandingLevels: new Map(),
      manaGels: new Map(SUBJECTS.map((subject) => [subject, ManaGel.create(subject, subject === "Math" ? 30 : 5)])),
      acquiredCardIds: new Set(["card-b"]),
      missedQuestions: new Map(),
    });
    const progressRepository: CultivationProgressRepository = {
      async findByStudentId() {
        return progress;
      },
      async save() {},
    };
    const cardRepository: CharacterCardRepository = {
      async findAll() {
        return [cardOf("card-b", 2, "English"), cardOf("card-a", 1, "Math"), cardOf("card-c", 3, "English")];
      },
      async findById() {
        return null;
      },
    };

    const collection = await new GetCharacterCollection(progressRepository, cardRepository).execute(studentId);

    expect(collection.map((entry) => entry.id)).toEqual(["card-a", "card-b", "card-c"]);
    expect(collection.map((entry) => entry.acquired)).toEqual([false, true, false]);
    expect(collection.map((entry) => entry.affordable)).toEqual([true, false, false]);
    expect(collection[2].ownedGels).toBe(5);
  });
});
