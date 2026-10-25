import { doc, getDoc, setDoc } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { Grade } from "../../domain/models/Grade";
import { ManaGel } from "../../domain/models/ManaGel";
import { SUBJECTS, type Subject } from "../../domain/models/Subject";
import { SubjectAbility } from "../../domain/models/SubjectAbility";
import { UnderstandingLevel } from "../../domain/models/UnderstandingLevel";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

const COLLECTION = "cultivationProgress";

type CultivationProgressDocument = {
  grade: Grade;
  abilities: Record<Subject, number>;
  understandingLevels: Record<string, { correctCount: number; totalCount: number }>;
  // 第19回ヒアリングで追加。それ以前のドキュメントには無いため、読み込み時は全科目0として扱う。
  manaGels?: Partial<Record<Subject, number>>;
  // 第20回ヒアリングで追加。それ以前のドキュメントには無いため、読み込み時は空として扱う。
  acquiredCardIds?: string[];
};

export class FirebaseCultivationProgressRepository implements CultivationProgressRepository {
  async findByStudentId(studentId: StudentId): Promise<CultivationProgress | null> {
    const snapshot = await getDoc(doc(firestore, COLLECTION, studentId.toString()));
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as CultivationProgressDocument;
    const abilities = new Map(
      SUBJECTS.map((subject) => [subject, SubjectAbility.create(subject, data.abilities[subject])]),
    );
    const understandingLevels = new Map(
      Object.entries(data.understandingLevels).map(([learningUnitId, level]) => [
        learningUnitId,
        UnderstandingLevel.create(learningUnitId, level.correctCount, level.totalCount),
      ]),
    );

    return CultivationProgress.reconstruct({
      studentId,
      grade: data.grade,
      abilities,
      understandingLevels,
      manaGels: new Map(SUBJECTS.map((subject) => [subject, ManaGel.create(subject, data.manaGels?.[subject] ?? 0)])),
      acquiredCardIds: new Set(data.acquiredCardIds ?? []),
    });
  }

  async save(progress: CultivationProgress): Promise<void> {
    const abilities = Object.fromEntries(
      SUBJECTS.map((subject) => [subject, progress.getAbility(subject).level]),
    ) as Record<Subject, number>;

    const understandingLevels = Object.fromEntries(
      [...progress.getUnderstandingLevels()].map(([learningUnitId, level]) => [
        learningUnitId,
        { correctCount: level.correctCount, totalCount: level.totalCount },
      ]),
    );

    const data: CultivationProgressDocument = {
      grade: progress.grade,
      abilities,
      understandingLevels,
      manaGels: Object.fromEntries(SUBJECTS.map((subject) => [subject, progress.getManaGel(subject).count])),
      acquiredCardIds: [...progress.getAcquiredCardIds()],
    };

    await setDoc(doc(firestore, COLLECTION, progress.studentId.toString()), data);
  }
}
