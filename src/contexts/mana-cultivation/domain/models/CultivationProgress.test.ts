import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { SUBJECTS } from "./Subject";
import { Curriculum } from "./Curriculum";
import { CultivationProgress } from "./CultivationProgress";
import { LearningUnit } from "./LearningUnit";
import { CharacterCard } from "./CharacterCard";
import { GelCost } from "./GelCost";
import { ManaGel } from "./ManaGel";
import { SubjectAbility } from "./SubjectAbility";
import { UnderstandingLevel } from "./UnderstandingLevel";

function initiate() {
  return CultivationProgress.initiate(StudentId.fromString("student-1"), "Second");
}

const mathCurriculum = Curriculum.create({
  id: "curriculum-math",
  examType: "JuniorHigh2ndYearRegularExam",
  subject: "Math",
  title: "中2数学",
});

function mathUnit(id: string) {
  return LearningUnit.create({ id, curriculumId: "curriculum-math", title: id, difficulty: 3 }, "Math");
}

describe("CultivationProgress", () => {
  it("initiate() starts every subject at level 0", () => {
    const progress = initiate();
    for (const subject of SUBJECTS) {
      expect(progress.getAbility(subject).level).toBe(0);
    }
  });

  it("initiate() records the given grade", () => {
    expect(initiate().grade).toBe("Second");
  });

  describe("completeLearningUnit", () => {
    const curriculum = Curriculum.create({
      id: "curriculum-1",
      examType: "JuniorHigh2ndYearRegularExam",
      subject: "Math",
      title: "中2数学",
    });
    const unit = LearningUnit.create(
      { id: "unit-1", curriculumId: "curriculum-1", title: "一次関数", difficulty: 3 },
      "Math",
    );

    it("increases only the matching subject's ability", () => {
      const progress = initiate();
      progress.completeLearningUnit(curriculum, unit);

      expect(progress.getAbility("Math").level).toBe(5);
      expect(progress.getAbility("English").level).toBe(0);
    });

    it("throws when the learning unit does not belong to the curriculum", () => {
      const progress = initiate();
      const mismatched = LearningUnit.create(
        { id: "unit-2", curriculumId: "other-curriculum", title: "別単元", difficulty: 1 },
        "Math",
      );

      expect(() => progress.completeLearningUnit(curriculum, mismatched)).toThrow();
      expect(progress.getAbility("Math").level).toBe(0);
    });

    it("keeps increasing on repeated completion, clamped at 100", () => {
      const progress = initiate();
      for (let i = 0; i < 25; i += 1) {
        progress.completeLearningUnit(curriculum, unit);
      }
      expect(progress.getAbility("Math").level).toBe(100);
    });
  });

  describe("recordAttempt", () => {
    it("updates only the targeted unit's understanding level", () => {
      const progress = initiate();
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", false);

      const level = progress.getUnderstanding("unit-1");
      expect(level.correctCount).toBe(1);
      expect(level.totalCount).toBe(2);
      expect(progress.getUnderstanding("unit-2").totalCount).toBe(0);
    });
  });

  describe("manaGel", () => {
    const englishCurriculum = Curriculum.create({
      id: "curriculum-english",
      examType: "JuniorHigh2ndYearRegularExam",
      subject: "English",
      title: "中2英語",
    });

    it("initiate() starts every subject with 0 gels", () => {
      const progress = initiate();
      for (const subject of SUBJECTS) {
        expect(progress.getManaGel(subject).count).toBe(0);
      }
    });

    it("a correct attempt adds 1 gel of the unit's subject only", () => {
      const progress = initiate();

      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);

      expect(progress.getManaGel("Math").count).toBe(1);
      for (const subject of SUBJECTS.filter((s) => s !== "Math")) {
        expect(progress.getManaGel(subject).count).toBe(0);
      }
    });

    it("an incorrect attempt adds no gels", () => {
      const progress = initiate();

      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", false);

      for (const subject of SUBJECTS) {
        expect(progress.getManaGel(subject).count).toBe(0);
      }
    });

    it("keeps adding a gel every time the same unit is answered correctly", () => {
      const progress = initiate();
      for (let i = 0; i < 3; i += 1) {
        progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);
      }

      expect(progress.getManaGel("Math").count).toBe(3);
    });

    it("throws and changes nothing when the unit does not belong to the curriculum", () => {
      const progress = initiate();

      expect(() => progress.recordAttempt(englishCurriculum, mathUnit("unit-1"), "q-unit-1", true)).toThrow();
      expect(progress.getUnderstanding("unit-1").totalCount).toBe(0);
      expect(progress.getMissedQuestionIds("unit-1")).toEqual([]);
      for (const subject of SUBJECTS) {
        expect(progress.getManaGel(subject).count).toBe(0);
      }
    });
  });

  describe("missed questions", () => {
    it("adds a question to its unit's missed list when answered incorrectly, only once", () => {
      const progress = initiate();

      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-1", false);
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-1", false);
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-2", true);

      expect(progress.getMissedQuestionIds("unit-1")).toEqual(["q-1"]);
    });

    it("removes a missed question once it is answered correctly", () => {
      const progress = initiate();
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-1", false);

      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-1", true);

      expect(progress.getMissedQuestionIds("unit-1")).toEqual([]);
    });

    it("keeps missed questions separated by unit", () => {
      const progress = initiate();
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-1", false);
      progress.recordAttempt(mathCurriculum, mathUnit("unit-2"), "q-9", false);

      expect(progress.getMissedQuestionIds("unit-1")).toEqual(["q-1"]);
      expect(progress.getMissedQuestionIds("unit-2")).toEqual(["q-9"]);
    });

    it("still records understanding and gels as before", () => {
      const progress = initiate();
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-1", false);
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-1", true);

      expect(progress.getUnderstanding("unit-1").totalCount).toBe(2);
      expect(progress.getManaGel("Math").count).toBe(1);
    });
  });

  describe("exchangeForCard", () => {
    const card = CharacterCard.create({
      id: "card-amou",
      number: 1,
      name: "天羽",
      furigana: "アモウ",
      title: "銀翼のキャプテン",
      flavor: "「決めるまで走り続ける」",
      rarity: 3,
      attribute: "Math",
      imageUrl: "/images/characters/amou-full.png",
      cost: GelCost.create("Math", 3),
    });

    function progressWithMathGels(count: number) {
      const progress = initiate();
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);
      for (let i = 1; i < count; i += 1) {
        progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);
      }
      return progress;
    }

    it("starts with no acquired cards", () => {
      const progress = initiate();

      expect(progress.hasAcquiredCard("card-amou")).toBe(false);
      expect(progress.getAcquiredCardIds().size).toBe(0);
    });

    it("spends the card's subject gels and acquires the card", () => {
      const progress = progressWithMathGels(5);

      progress.exchangeForCard(card);

      expect(progress.getManaGel("Math").count).toBe(2);
      expect(progress.hasAcquiredCard("card-amou")).toBe(true);
      for (const subject of SUBJECTS.filter((s) => s !== "Math")) {
        expect(progress.getManaGel(subject).count).toBe(0);
      }
    });

    it("throws and changes nothing when gels are not enough", () => {
      const progress = progressWithMathGels(2);

      expect(() => progress.exchangeForCard(card)).toThrow();
      expect(progress.getManaGel("Math").count).toBe(2);
      expect(progress.hasAcquiredCard("card-amou")).toBe(false);
    });

    it("throws and spends nothing when the card is already acquired", () => {
      const progress = progressWithMathGels(6);
      progress.exchangeForCard(card);

      expect(() => progress.exchangeForCard(card)).toThrow();
      expect(progress.getManaGel("Math").count).toBe(3);
    });
  });

  describe("changeGrade", () => {
    const card = CharacterCard.create({
      id: "card-amou",
      number: 1,
      name: "天羽",
      furigana: "アモウ",
      title: "銀翼のキャプテン",
      flavor: "「決めるまで走り続ける」",
      rarity: 3,
      attribute: "Math",
      imageUrl: "/images/characters/amou-full.png",
      cost: GelCost.create("Math", 1),
    });

    function progressWithHistory() {
      const progress = initiate();
      progress.completeLearningUnit(mathCurriculum, mathUnit("unit-1"));
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);
      progress.exchangeForCard(card);
      return progress;
    }

    it("switches to another launched grade and keeps abilities, understanding, gels and cards", () => {
      const progress = progressWithHistory();

      progress.changeGrade("Pre");

      expect(progress.grade).toBe("Pre");
      expect(progress.getAbility("Math").level).toBe(5);
      expect(progress.getUnderstanding("unit-1").rate).toBe(100);
      expect(progress.getManaGel("Math").count).toBe(1);
      expect(progress.hasAcquiredCard("card-amou")).toBe(true);
    });

    it("changes nothing when the same grade is chosen", () => {
      const progress = progressWithHistory();

      progress.changeGrade("Second");

      expect(progress.grade).toBe("Second");
    });

    it("rejects a grade that is not launched yet and leaves the grade unchanged", () => {
      const progress = progressWithHistory();

      expect(() => progress.changeGrade("Third")).toThrow();
      expect(progress.grade).toBe("Second");
    });
  });

  describe("getUnderstandingLevels", () => {
    it("exposes every recorded understanding level, keyed by learningUnitId", () => {
      const progress = initiate();
      progress.recordAttempt(mathCurriculum, mathUnit("unit-1"), "q-unit-1", true);

      const levels = progress.getUnderstandingLevels();

      expect(levels.size).toBe(1);
      expect(levels.get("unit-1")?.correctCount).toBe(1);
    });
  });

  describe("reconstruct", () => {
    it("restores abilities, understanding levels, gels and cards without re-deriving them", () => {
      const studentId = StudentId.fromString("student-1");
      const abilities = new Map(SUBJECTS.map((subject) => [subject, SubjectAbility.create(subject, 42)]));
      const understandingLevels = new Map([["unit-1", UnderstandingLevel.create("unit-1", 3, 4)]]);

      const progress = CultivationProgress.reconstruct({
        studentId,
        grade: "Second",
        abilities,
        understandingLevels,
        manaGels: new Map(SUBJECTS.map((subject) => [subject, ManaGel.create(subject, 7)])),
        acquiredCardIds: new Set(["card-amou"]),
        missedQuestions: new Map([["q-1", "unit-1"]]),
      });

      expect(progress.studentId).toBe(studentId);
      expect(progress.grade).toBe("Second");
      expect(progress.getAbility("Math").level).toBe(42);
      expect(progress.getUnderstanding("unit-1").correctCount).toBe(3);
      expect(progress.getManaGel("Japanese").count).toBe(7);
      expect(progress.hasAcquiredCard("card-amou")).toBe(true);
      expect(progress.getMissedQuestionIds("unit-1")).toEqual(["q-1"]);
    });
  });
});
