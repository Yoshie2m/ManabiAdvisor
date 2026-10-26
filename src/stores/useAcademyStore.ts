import { create } from "zustand";

import type { Buddy } from "@/contexts/house-assignment/domain/models/Buddy";
import type { House } from "@/contexts/house-assignment/domain/models/House";
import { StudentId } from "@/contexts/house-assignment/domain/models/StudentId";
import { FirebaseBuddyCheerRepository } from "@/contexts/house-assignment/infrastructure/firebase/FirebaseBuddyCheerRepository";
import { FirebaseStudentRepository } from "@/contexts/house-assignment/infrastructure/firebase/FirebaseStudentRepository";
import { ChooseBuddy } from "@/contexts/house-assignment/usecase/ChooseBuddy/ChooseBuddy";
import { EnrollStudent } from "@/contexts/house-assignment/usecase/EnrollStudent/EnrollStudent";
import { GetTodaysBuddyCheer } from "@/contexts/house-assignment/usecase/GetTodaysBuddyCheer/GetTodaysBuddyCheer";
import type { Grade } from "@/contexts/mana-cultivation/domain/models/Grade";
import { FirebaseCharacterCardRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseCharacterCardRepository";
import { FirebaseCultivationProgressRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseCultivationProgressRepository";
import { FirebaseCurriculumRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseCurriculumRepository";
import { FirebaseLearningUnitRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseLearningUnitRepository";
import { FirebaseQuestionRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseQuestionRepository";
import { FirebaseQuizSessionRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseQuizSessionRepository";
import { FirebaseUpcomingExamRepository } from "@/contexts/mana-cultivation/infrastructure/firebase/FirebaseUpcomingExamRepository";
import { ExchangeGelsForCard } from "@/contexts/mana-cultivation/usecase/ExchangeGelsForCard/ExchangeGelsForCard";
import { FindQuizSession } from "@/contexts/mana-cultivation/usecase/FindQuizSession/FindQuizSession";
import type { CultivationOverview } from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import { GetCultivationOverview } from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import {
  GetCharacterCollection,
  type CharacterCardView,
} from "@/contexts/mana-cultivation/usecase/GetCharacterCollection/GetCharacterCollection";
import { GetQuestionsForLearningUnit } from "@/contexts/mana-cultivation/usecase/GetQuestionsForLearningUnit/GetQuestionsForLearningUnit";
import { RecordAttempt } from "@/contexts/mana-cultivation/usecase/RecordAttempt/RecordAttempt";
import { RecordQuizAttempts } from "@/contexts/mana-cultivation/usecase/RecordQuizAttempts/RecordQuizAttempts";
import { ChangeGrade } from "@/contexts/mana-cultivation/usecase/ChangeGrade/ChangeGrade";
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
const chooseBuddyUsecase = new ChooseBuddy(studentRepository);
const characterCardRepository = new FirebaseCharacterCardRepository();
const getCharacterCollection = new GetCharacterCollection(cultivationProgressRepository, characterCardRepository);
const exchangeGelsForCard = new ExchangeGelsForCard(cultivationProgressRepository, characterCardRepository);
const getTodaysBuddyCheer = new GetTodaysBuddyCheer(new FirebaseBuddyCheerRepository());
const startCultivation = new StartCultivation(cultivationProgressRepository);
const changeGradeUsecase = new ChangeGrade(cultivationProgressRepository);
const recordAttempt = new RecordAttempt(cultivationProgressRepository, learningUnitRepository, curriculumRepository);
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
const recordQuizAttempts = new RecordQuizAttempts(
  cultivationProgressRepository,
  learningUnitRepository,
  curriculumRepository,
);

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
  explanation: string | null;
  imageUrl: string | null;
  answerImageUrl: string | null;
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
  isStudentLoading: boolean;
  house: House | null;
  isEnrolled: boolean;
  overview: CultivationOverview | null;
  isLoading: boolean;
  error: string | null;
  // 起動直後の1回だけ、入学済みなら鑑定画面から修練場へ自動遷移させる（戻るリンクで戻れるように）
  hasLandingRedirectSettled: boolean;
  settleLandingRedirect: () => void;
  initialize: () => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  enroll: (house: House, grade: Grade) => Promise<void>;
  buddy: Buddy | null;
  buddyCheer: string | null;
  chooseBuddy: (buddy: Buddy) => Promise<void>;
  characterCollection: CharacterCardView[] | null;
  refreshCharacterCollection: () => Promise<void>;
  exchangeForCard: (cardId: string) => Promise<void>;
  refreshBuddyCheer: () => Promise<void>;
  changeGrade: (grade: Grade) => Promise<void>;
  refreshOverview: () => Promise<void>;
  recordAttemptFor: (learningUnitId: string, questionId: string, isCorrect: boolean) => Promise<void>;
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
  isStudentLoading: false,
  house: null,
  isEnrolled: false,
  overview: null,
  isLoading: false,
  error: null,
  hasLandingRedirectSettled: false,

  settleLandingRedirect: () => {
    if (!get().hasLandingRedirectSettled) {
      set({ hasLandingRedirectSettled: true });
    }
  },

  initialize: () => {
    if (hasInitialized) {
      return;
    }
    hasInitialized = true;

    watchAuthState(async (user) => {
      if (!user) {
        set({
          authUid: null,
          isAuthLoading: false,
          buddy: null,
          buddyCheer: null,
          characterCollection: null,
          isStudentLoading: false,
          house: null,
          isEnrolled: false,
          overview: null,
          hasLandingRedirectSettled: false,
        });
        return;
      }

      set({ authUid: user.uid, isAuthLoading: false, isStudentLoading: true, error: null });
      try {
        const existing = await studentRepository.findById(StudentId.fromString(user.uid));
        if (existing) {
          set({ house: existing.house, buddy: existing.buddy, isEnrolled: true, isStudentLoading: false });
          void get().refreshBuddyCheer();
          await get().refreshOverview();
        } else {
          set({ house: null, buddy: null, buddyCheer: null, isEnrolled: false, overview: null, isStudentLoading: false });
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error), isStudentLoading: false });
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

  buddy: null,
  buddyCheer: null,
  characterCollection: null,

  refreshCharacterCollection: async () => {
    const collection = await getCharacterCollection.execute(currentStudentId(get().authUid));
    set({ characterCollection: collection });
  },

  exchangeForCard: async (cardId) => {
    set({ isLoading: true, error: null });
    try {
      await exchangeGelsForCard.execute(currentStudentId(get().authUid), cardId);
      await Promise.all([get().refreshCharacterCollection(), get().refreshOverview()]);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  chooseBuddy: async (buddy) => {
    set({ isLoading: true, error: null });
    try {
      await chooseBuddyUsecase.execute(currentStudentId(get().authUid), buddy);
      set({ buddy });
      await get().refreshBuddyCheer();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshBuddyCheer: async () => {
    const buddy = get().buddy;
    if (!buddy) {
      set({ buddyCheer: null });
      return;
    }
    const cheer = await getTodaysBuddyCheer.execute(buddy, new Date());
    set({ buddyCheer: cheer?.message ?? null });
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

  changeGrade: async (grade) => {
    set({ isLoading: true, error: null });
    try {
      await changeGradeUsecase.execute(currentStudentId(get().authUid), grade);
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

  recordAttemptFor: async (learningUnitId, questionId, isCorrect) => {
    try {
      const studentId = currentStudentId(get().authUid);
      await recordAttempt.execute(studentId, learningUnitId, questionId, isCorrect);
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
        explanation: question.explanation,
        imageUrl: question.imageUrl,
        answerImageUrl: question.answerImageUrl,
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
