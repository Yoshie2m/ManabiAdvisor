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
import { ExchangeGelsForCard } from "./ExchangeGelsForCard";

const card = CharacterCard.create({
  id: "card-kageshima",
  number: 2,
  name: "影島",
  furigana: "カゲシマ",
  title: "放課後のギタリスト",
  flavor: "「…音が変わるんだ」",
  rarity: 3,
  attribute: "English",
  imageUrl: "/images/characters/kageshima-full.png",
  cost: GelCost.create("English", 30),
});

const cardRepository: CharacterCardRepository = {
  async findAll() {
    return [card];
  },
  async findById(id) {
    return id === card.id ? card : null;
  },
};

function progressWithEnglishGels(studentId: StudentId, count: number) {
  return CultivationProgress.reconstruct({
    studentId,
    grade: "Second",
    abilities: new Map(SUBJECTS.map((subject) => [subject, SubjectAbility.initial(subject)])),
    understandingLevels: new Map(),
    currentDailyMission: null,
    currentMockExamMission: null,
    manaGels: new Map(SUBJECTS.map((subject) => [subject, ManaGel.create(subject, subject === "English" ? count : 0)])),
    acquiredCardIds: new Set(),
  });
}

function fakeProgressRepository() {
  const progresses = new Map<string, CultivationProgress>();
  const repository: CultivationProgressRepository = {
    async findByStudentId(studentId) {
      return progresses.get(studentId.toString()) ?? null;
    },
    async save(progress) {
      progresses.set(progress.studentId.toString(), progress);
    },
  };
  return { repository, progresses };
}

describe("ExchangeGelsForCard", () => {
  it("spends gels, acquires the card, and saves the progress", async () => {
    const { repository, progresses } = fakeProgressRepository();
    const studentId = StudentId.fromString("student-1");
    progresses.set("student-1", progressWithEnglishGels(studentId, 31));

    await new ExchangeGelsForCard(repository, cardRepository).execute(studentId, card.id);

    expect(progresses.get("student-1")?.getManaGel("English").count).toBe(1);
    expect(progresses.get("student-1")?.hasAcquiredCard(card.id)).toBe(true);
  });

  it("throws when the card does not exist", async () => {
    const { repository, progresses } = fakeProgressRepository();
    const studentId = StudentId.fromString("student-1");
    progresses.set("student-1", progressWithEnglishGels(studentId, 31));

    await expect(new ExchangeGelsForCard(repository, cardRepository).execute(studentId, "card-missing")).rejects.toThrow();
  });

  it("throws when the student has not started cultivation", async () => {
    const { repository } = fakeProgressRepository();

    await expect(
      new ExchangeGelsForCard(repository, cardRepository).execute(StudentId.fromString("student-1"), card.id),
    ).rejects.toThrow();
  });
});
