import { create } from "zustand";

import type { House } from "@/contexts/house-assignment/domain/models/House";
import { StudentId } from "@/contexts/house-assignment/domain/models/StudentId";
import { FirebaseStudentRepository } from "@/contexts/house-assignment/infrastructure/firebase/FirebaseStudentRepository";
import { EnrollStudent } from "@/contexts/house-assignment/usecase/EnrollStudent/EnrollStudent";
import type { Grade } from "@/contexts/mana-cultivation/domain/models/Grade";
import { FirebaseCultivationProgressRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseCultivationProgressRepository";
import { FirebaseCurriculumRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseCurriculumRepository";
import { FirebaseLearningUnitRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseLearningUnitRepository";
import { FirebaseQuestionRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseQuestionRepository";
import { FirebaseQuizSessionRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseQuizSessionRepository";
import { FirebaseUpcomingExamRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseUpcomingExamRepository";
import { FindQuizSession } from "@/contexts/mana-cultivation/usecase/FindQuizSession/FindQuizSession";
import { GenerateDailyMission } from "@/contexts/mana-cultivation/usecase/GenerateDailyMission/GenerateDailyMission";
import type { CultivationOverview } from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import { GetCultivationOverview } from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import { GetQuestionsForLearningUnit } from "@/contexts/mana-cultivation/usecase/GetQuestionsForLearningUnit/GetQuestionsForLearningUnit";
import { OfferMockExamMission } from "@/contexts/mana-cultivation/usecase/OfferMockExamMission/OfferMockExamMission";
import { RecordAttempt } from "@/contexts/mana-cultivation/usecase/RecordAttempt/RecordAttempt";
import { RecordQuizAttempts } from "@/contexts/mana-cultivation/usecase/RecordQuizAttempts/RecordQuizAttempts";
import { StartCultivation } from "@/contexts/mana-cultivation/usecase/StartCultivation/StartCultivation";
import { StartQuiz } from "@/contexts/mana-cultivation/usecase/StartQuiz/StartQuiz";
import type { QuizAnswerResult } from "@/contexts/mana-cultivation/usecase/SyncQuizProgress/SyncQuizProgress";
import { SyncQuizProgress } from "@/contexts/mana-cultivation/usecase/SyncQuizProgress/SyncQuizProgress";
import {
  signIn as firebaseSignIn,
  signOutUser as firebaseSignOut,
  signUp as firebaseSignUp,
  watchAuthState,
} from "@/lib/auth";

// --- 構成（Composition Root）: Firebase実装を束ねる。 ---
const studentRepository = new FirebaseStudentRepository();
const curriculumRepository = new FirebaseCurriculumRepository();
const learningUnitRepository = new FirebaseLearningUnitRepository();
const upcomingExamRepository = new FirebaseUpcomingExamRepository();
const cultivationProgressRepository = new FirebaseCultivationProgressRepository();
const questionRepository = new FirebaseQuestionRepository();
const quizSessionRepository = new FirebaseQuizSessionRepository();

const enrollStudent = new EnrollStudent(studentRepository);
const startCultivation = new StartCultivation(cultivationProgressRepository);
const recordAttempt = new RecordAttempt(cultivationProgressRepository);
const generateDailyMission = new GenerateDailyMission(cultivationProgressRepository, upcomingExamRepository);
const offerMockExamMission = new OfferMockExamMission(cultivationProgressRepository, upcomingExamRepository);
const getCultivationOverview = new GetCultivationOverview(
  cultivationProgressRepository,
  curriculumRepository,
  learningUnitRepository,
  upcomingExamRepository,
);
const getQuestionsForLearningUnit = new GetQuestionsForLearningUnit(questionRepository);
const findQuizSession = new FindQuizSession(quizSessionRepository);
const startQuiz = new StartQuiz(quizSessionRepository);
const syncQuizProgress = new SyncQuizProgress(
  quizSessionRepository,
  cultivationProgressRepository,
  curriculumRepository,
  learningUnitRepository,
);
const recordQuizAttempts = new RecordQuizAttempts(cultivationProgressRepository);

function currentStudentId(authUid: string | null): StudentId {
  if (!authUid) {
    throw new Error("ログインしていません");
  }
  return StudentId.fromString(authUid);
}

// initialize() はAuthInitializerコンポーネントから一度だけ呼ばれる想定。
let hasInitialized = false;

export type QuestionView = {
  id: string;
  prompt: string;
  answer: string;
};

export type QuizSessionView = {
  learningUnitId: string;
  totalQuestions: number;
  currentIndex: number;
  isComplete: boolean;
  progressRatio: number;
};

function toQuizSessionView(session: { learningUnitId: string; totalQuestions: number; currentIndex: number; isComplete: boolean; progressRatio: number }): QuizSessionView {
  return {
    learningUnitId: session.learningUnitId,
    totalQuestions: session.totalQuestions,
    currentIndex: session.currentIndex,
    isComplete: session.isComplete,
    progressRatio: session.progressRatio,
  };
}

type AcademyState = {
  authUid: string | null;
  isAuthLoading: boolean;
  house: House | null;
  isEnrolled: boolean;
  overview: CultivationOverview | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  enroll: (house: House, grade: Grade) => Promise<void>;
  refreshOverview: () => Promise<void>;
  recordAttemptFor: (learningUnitId: string, isCorrect: boolean) => Promise<void>;
  assignDailyMission: () => Promise<void>;
  offerMockExam: () => Promise<void>;
  fetchQuestions: (learningUnitId: string) => Promise<QuestionView[]>;
  checkQuizSession: (learningUnitId: string) => Promise<QuizSessionView | null>;
  startQuizSession: (learningUnitId: string, totalQuestions: number) => Promise<QuizSessionView>;
  syncQuizProgressFor: (
    learningUnitId: string,
    results: QuizAnswerResult[],
    totalQuestions: number,
  ) => Promise<QuizSessionView | null>;
  recordQuizAttemptsFor: (learningUnitId: string, results: QuizAnswerResult[]) => Promise<void>;
};

export const useAcademyStore = create<AcademyState>((set, get) => ({
  authUid: null,
  isAuthLoading: true,
  house: null,
  isEnrolled: false,
  overview: null,
  isLoading: false,
  error: null,

  initialize: () => {
    if (hasInitialized) {
      return;
    }
    hasInitialized = true;

    watchAuthState(async (user) => {
      if (!user) {
        set({ authUid: null, isAuthLoading: false, house: null, isEnrolled: false, overview: null });
        return;
      }

      set({ authUid: user.uid, isAuthLoading: false, error: null });
      try {
        const existing = await studentRepository.findById(StudentId.fromString(user.uid));
        if (existing) {
          set({ house: existing.house, isEnrolled: true });
          await get().refreshOverview();
        } else {
          set({ house: null, isEnrolled: false, overview: null });
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error) });
      }
    });
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignUp(email, password);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await firebaseSignIn(email, password);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  signOutUser: async () => {
    await firebaseSignOut();
  },

  enroll: async (house, grade) => {
    set({ isLoading: true, error: null });
    try {
      const studentId = currentStudentId(get().authUid);
      await enrollStudent.execute(studentId, house);
      await startCultivation.execute(studentId, grade);
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
      const studentId = currentStudentId(get().authUid);
      const overview = await getCultivationOverview.execute(studentId);
      set({ overview, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  recordAttemptFor: async (learningUnitId, isCorrect) => {
    try {
      const studentId = currentStudentId(get().authUid);
      await recordAttempt.execute(studentId, learningUnitId, isCorrect);
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  assignDailyMission: async () => {
    try {
      const studentId = currentStudentId(get().authUid);
      await generateDailyMission.execute(studentId, `daily-${Date.now()}`);
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  offerMockExam: async () => {
    try {
      const studentId = currentStudentId(get().authUid);
      await offerMockExamMission.execute(studentId, `mock-${Date.now()}`);
      await get().refreshOverview();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  fetchQuestions: async (learningUnitId) => {
    const questions = await getQuestionsForLearningUnit.execute(learningUnitId);
    return questions
      .map((question) => ({
        id: question.id,
        prompt: question.prompt,
        answer: question.answer,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  },

  checkQuizSession: async (learningUnitId) => {
    const studentId = currentStudentId(get().authUid);
    const session = await findQuizSession.execute(studentId, learningUnitId);
    return session ? toQuizSessionView(session) : null;
  },

  startQuizSession: async (learningUnitId, totalQuestions) => {
    const studentId = currentStudentId(get().authUid);
    const session = await startQuiz.execute(studentId, learningUnitId, totalQuestions);
    return toQuizSessionView(session);
  },

  syncQuizProgressFor: async (learningUnitId, results, totalQuestions) => {
    const studentId = currentStudentId(get().authUid);
    const result = await syncQuizProgress.execute(studentId, learningUnitId, results, totalQuestions);
    await get().refreshOverview();
    return result.session ? toQuizSessionView(result.session) : null;
  },

  recordQuizAttemptsFor: async (learningUnitId, results) => {
    const studentId = currentStudentId(get().authUid);
    await recordQuizAttempts.execute(studentId, learningUnitId, results);
    await get().refreshOverview();
  },
}));
