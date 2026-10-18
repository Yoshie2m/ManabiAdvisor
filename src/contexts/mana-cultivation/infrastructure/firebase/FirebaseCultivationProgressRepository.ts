import { doc, getDoc, setDoc } from "firebase/firestore/lite";

import { firestore } from "@/lib/firebase";

import type { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { CultivationProgress } from "../../domain/models/CultivationProgress";
import type { Grade } from "../../domain/models/Grade";
import { Mission, type MissionType } from "../../domain/models/Mission";
import { SUBJECTS, type Subject } from "../../domain/models/Subject";
import { SubjectAbility } from "../../domain/models/SubjectAbility";
import { UnderstandingLevel } from "../../domain/models/UnderstandingLevel";
import type { CultivationProgressRepository } from "../../domain/repositories/CultivationProgressRepository";

const COLLECTION = "cultivationProgress";

type MissionDocument = {
  id: string;
  type: MissionType;
  targetLearningUnitIds: string[];
};

type CultivationProgressDocument = {
  grade: Grade;
  abilities: Record<Subject, number>;
  understandingLevels: Record<string, { correctCount: number; totalCount: number }>;
  currentDailyMission: MissionDocument | null;
  currentMockExamMission: MissionDocument | null;
};

function toMission(document: MissionDocument | null): Mission | null {
  return document ? Mission.reconstruct(document.id, document.type, document.targetLearningUnitIds) : null;
}

function fromMission(mission: Mission | null): MissionDocument | null {
  return mission
    ? { id: mission.id, type: mission.type, targetLearningUnitIds: [...mission.targetLearningUnitIds] }
    : null;
}

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
      currentDailyMission: toMission(data.currentDailyMission),
      currentMockExamMission: toMission(data.currentMockExamMission),
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
      currentDailyMission: fromMission(progress.getCurrentDailyMission()),
      currentMockExamMission: fromMission(progress.getMockExamMission()),
    };

    await setDoc(doc(firestore, COLLECTION, progress.studentId.toString()), data);
  }
}
