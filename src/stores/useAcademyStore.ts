import { create } from "zustand";

import type { House } from "@/contexts/house-assignment/domain/models/House";
import { StudentId } from "@/contexts/house-assignment/domain/models/StudentId";
import { InMemoryStudentRepository } from "@/contexts/house-assignment/infrastructure/memory/InMemoryStudentRepository";
import { EnrollStudent } from "@/contexts/house-assignment/usecase/EnrollStudent/EnrollStudent";
import type { Grade } from "@/contexts/mana-cultivation/domain/models/Grade";
import { InMemoryCultivationProgressRepository } from "@/contexts/mana-cultivation/infrastructure/memory/InMemoryCultivationProgressRepository";
import { InMemoryCurriculumRepository } from "@/contexts/mana-cultivation/infrastructure/memory/InMemoryCurriculumRepository";
import { InMemoryLearningUnitRepository } from "@/contexts/mana-cultivation/infrastructure/memory/InMemoryLearningUnitRepository";
import { InMemoryUpcomingExamRepository } from "@/contexts/mana-cultivation/infrastructure/memory/InMemoryUpcomingExamRepository";
import { curricula, learningUnits, upcomingExams } from "@/contexts/mana-cultivation/infrastructure/memory/seedData";
import { CompleteLearningUnit } from "@/contexts/mana-cultivation/usecase/CompleteLearningUnit/CompleteLearningUnit";
import { GenerateDailyMission } from "@/contexts/mana-cultivation/usecase/GenerateDailyMission/GenerateDailyMission";
import type { CultivationOverview } from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import { GetCultivationOverview } from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import { OfferMockExamMission } from "@/contexts/mana-cultivation/usecase/OfferMockExamMission/OfferMockExamMission";
import { RecordAttempt } from "@/contexts/mana-cultivation/usecase/RecordAttempt/RecordAttempt";
import { StartCultivation } from "@/contexts/mana-cultivation/usecase/StartCultivation/StartCultivation";

// --- 構成（Composition Root）: 動作確認用にインメモリ実装を束ねる。 ---
// DBと連携する際は、ここのリポジトリ実装をFirebase版に差し替えるだけでよい。
const studentRepository = new InMemoryStudentRepository();
const curriculumRepository = new InMemoryCurriculumRepository(curricula);
const learningUnitRepository = new InMemoryLearningUnitRepository(learningUnits);
const upcomingExamRepository = new InMemoryUpcomingExamRepository(upcomingExams);
const cultivationProgressRepository = new InMemoryCultivationProgressRepository();

const enrollStudent = new EnrollStudent(studentRepository);
const startCultivation = new StartCultivation(cultivationProgressRepository);
const completeLearningUnit = new CompleteLearningUnit(
  cultivationProgressRepository,
  curriculumRepository,
  learningUnitRepository,
);
const recordAttempt = new RecordAttempt(cultivationProgressRepository);
const generateDailyMission = new GenerateDailyMission(cultivationProgressRepository, upcomingExamRepository);
const offerMockExamMission = new OfferMockExamMission(cultivationProgressRepository, upcomingExamRepository);
const getCultivationOverview = new GetCultivationOverview(
  cultivationProgressRepository,
  curriculumRepository,
  learningUnitRepository,
  upcomingExamRepository,
);

// 動作確認用: ログイン機構がまだ無いため、生徒は1人（固定ID）として扱う。
const DEMO_STUDENT_ID = StudentId.fromString("demo-student");

type AcademyState = {
  house: House | null;
  isEnrolled: boolean;
  overview: CultivationOverview | null;
  isLoading: boolean;
  error: string | null;
  enroll: (house: House, grade: Grade) => Promise<void>;
  refreshOverview: () => Promise<void>;
  completeUnit: (learningUnitId: string) => Promise<void>;
  recordAttemptFor: (learningUnitId: string, isCorrect: boolean) => Promise<void>;
  assignDailyMission: () => Promise<void>;
  offerMockExam: () => Promise<void>;
};

export const useAcademyStore = create<AcademyState>((set, get) => ({
  house: null,
  isEnrolled: false,
  overview: null,
  isLoading: false,
  error: null,

  enroll: async (house, grade) => {
    set({ isLoading: true, error: null });
    try {
      await enrollStudent.execute(DEMO_STUDENT_ID, house);
      await startCultivation.execute(DEMO_STUDENT_ID, grade);
      set({ house, isEnrolled: true });
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshOverview: async () => {
    try {
      const overview = await getCultivationOverview.execute(DEMO_STUDENT_ID);
      set({ overview, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  completeUnit: async (learningUnitId) => {
    try {
      await completeLearningUnit.execute(DEMO_STUDENT_ID, learningUnitId);
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  recordAttemptFor: async (learningUnitId, isCorrect) => {
    try {
      await recordAttempt.execute(DEMO_STUDENT_ID, learningUnitId, isCorrect);
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  assignDailyMission: async () => {
    try {
      await generateDailyMission.execute(DEMO_STUDENT_ID, `daily-${Date.now()}`);
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  offerMockExam: async () => {
    try {
      await offerMockExamMission.execute(DEMO_STUDENT_ID, `mock-${Date.now()}`);
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
