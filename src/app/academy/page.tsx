"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GrimoireCard } from "@/components/ui/GrimoireCard";
import { QuizCard, type QuizKind } from "@/components/ui/QuizCard";
import { TabBar } from "@/components/ui/TabBar";
import { TabIcon, type TabIconName } from "@/components/ui/TabIcon";
import type { Grade } from "@/contexts/mana-cultivation/domain/models/Grade";
import type { QuestionType } from "@/contexts/mana-cultivation/domain/models/QuestionType";
import { SUBJECTS, type Subject } from "@/contexts/mana-cultivation/domain/models/Subject";
import { answerCorrectnessPolicy } from "@/contexts/mana-cultivation/domain/specs/AnswerCorrectnessPolicy";
import type {
  CultivationOverview,
  LearningUnitView,
} from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import type { QuizAnswerResult } from "@/contexts/mana-cultivation/usecase/SyncQuizProgress/SyncQuizProgress";
import { useAcademyStore, type QuestionView, type QuizSessionView } from "@/stores/useAcademyStore";

const SUBJECT_LABEL: Record<Subject, string> = {
  English: "英語",
  Math: "数学",
  Japanese: "国語",
  Science: "理科",
  SocialStudies: "社会",
};

// 5つの魔導属性（教科の魔法名）。
const SUBJECT_ELEMENT: Record<Subject, string> = {
  Japanese: "言霊（ことだま）",
  Math: "数秘（すうひ）",
  English: "異界語（いかいご）",
  Science: "錬金（れんきん）",
  SocialStudies: "地誌・歴史（ちし・れきし）",
};

const SUBJECT_ICON: Record<Subject, TabIconName> = {
  Japanese: "kotodama",
  Math: "suhi",
  English: "ikaigo",
  Science: "renkin",
  SocialStudies: "chishi-rekishi",
};

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  VocabularyTest: "単語テスト",
  PassageTranslationToJapanese: "本文の和訳",
  PassageTranslationToEnglish: "英訳問題",
  Calculation: "計算問題",
  WordProblem: "文章題",
  KanjiWriting: "漢字（書き）",
  KanjiReading: "漢字（読み）",
};

// QuestionTypeごとのQuizCard表示設定。kindの既定文言では合わない組み合わせ
// （国語の漢字など）は chapter/instruction/言語を明示的に上書きする。
type QuizCardPresetProps = {
  kind: QuizKind;
  chapter?: string;
  instruction?: string;
  promptLang?: string;
  answerLang?: string;
};

const QUIZ_CARD_PRESET_BY_QUESTION_TYPE: Record<QuestionType, QuizCardPresetProps> = {
  VocabularyTest: { kind: "vocabulary" },
  PassageTranslationToJapanese: { kind: "ja-translation" },
  PassageTranslationToEnglish: { kind: "en-translation" },
  Calculation: { kind: "math" },
  WordProblem: { kind: "math" },
  KanjiWriting: {
    kind: "ja-translation",
    chapter: "Kanji · 書き",
    instruction: "次の文のカタカナを漢字に直しなさい。",
    promptLang: "ja",
    answerLang: "ja",
  },
  KanjiReading: {
    kind: "vocabulary",
    chapter: "Kanji · 読み",
    instruction: "次の漢字の読みをひらがなで答えなさい。",
    promptLang: "ja",
    answerLang: "ja",
  },
};

const GRADE_LABEL: Record<Grade, string> = {
  Pre: "プレ期間（小6）",
  First: "ファーストグレード（中1）",
  Second: "セカンドグレード（中2）",
  Third: "サードグレード（中3）",
  Fourth: "フォースグレード（高1）",
  Fifth: "フィフスグレード（高2）",
  Sixth: "シックスグレード（高3）",
};

// 「ニガテの幻影」とみなす理解度のしきい値。一度も挑んでいない単元（attemptCount=0）は対象外。
const WEAK_UNDERSTANDING_THRESHOLD = 60;

type Tab = "hall" | "library" | "tower";

// カタカナの連続区間を強調表示する（「漢字（書き）」の直すべき箇所）。
// highlightWhole=trueの場合は文全体を強調する（「漢字（読み）」は熟語そのものが問題文のため）。
function HighlightedPrompt({
  text,
  lang,
  highlightWhole = false,
}: {
  text: string;
  lang?: string;
  highlightWhole?: boolean;
}) {
  if (highlightWhole) {
    return (
      <p className="text-lg" lang={lang}>
        <strong className="rounded bg-house-accent/20 px-1 font-semibold text-house-accent">{text}</strong>
      </p>
    );
  }

  const parts = text.split(/([゠-ヿー]+)/g);
  return (
    <p className="text-lg" lang={lang}>
      {parts.map((part, index) =>
        part && /^[゠-ヿー]+$/.test(part) ? (
          <strong key={index} className="rounded bg-house-accent/20 px-1 font-semibold text-house-accent">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}

type QuizPhase = "loading" | "resume-dialog" | "in-progress" | "finished";

// クイズ画面の起動処理（全問の先読み・中断セッションの確認・新規開始）を
// 「テキスト入力式」「セルフ採点式」の両パネルで共有する。
function useQuizBootstrap(unit: LearningUnitView) {
  const fetchQuestions = useAcademyStore((state) => state.fetchQuestions);
  const checkQuizSession = useAcademyStore((state) => state.checkQuizSession);
  const startQuizSession = useAcademyStore((state) => state.startQuizSession);

  const [phase, setPhase] = useState<"loading" | "resume-dialog" | "ready">("loading");
  const [questions, setQuestions] = useState<QuestionView[]>([]);
  const [session, setSession] = useState<QuizSessionView | null>(null);
  const [displayedIndex, setDisplayedIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const fetchedQuestions = await fetchQuestions(unit.id);
      const existing = await checkQuizSession(unit.id);
      if (cancelled) return;

      setQuestions(fetchedQuestions);
      if (existing && !existing.isComplete) {
        setSession(existing);
        setDisplayedIndex(existing.currentIndex);
        setPhase("resume-dialog");
      } else {
        const started = await startQuizSession(unit.id, fetchedQuestions.length);
        if (cancelled) return;
        setSession(started);
        setDisplayedIndex(0);
        setPhase("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
    // 初回マウント時のみ実行する（unit.idは固定）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id]);

  async function restartFromBeginning() {
    const started = await startQuizSession(unit.id, questions.length);
    setSession(started);
    setDisplayedIndex(0);
    setPhase("ready");
  }

  return {
    phase,
    setPhase,
    questions,
    session,
    setSession,
    displayedIndex,
    setDisplayedIndex,
    restartFromBeginning,
  };
}

function QuizResumeDialog({
  currentIndex,
  onResume,
  onRestart,
  onClose,
}: {
  currentIndex: number;
  onResume: () => void;
  onRestart: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-house-primary/40 bg-house-primary/5 p-4 text-sm">
      <p>前回の続き（{currentIndex + 1}問目）から再開しますか？</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onResume}
          className="rounded-md bg-house-primary px-3 py-1.5 text-xs font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
        >
          続きから
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md border border-house-primary/60 px-3 py-1.5 text-xs hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
        >
          最初からやり直す
        </button>
        <button type="button" onClick={onClose} className="ml-auto text-xs opacity-70 hover:opacity-100">
          閉じる
        </button>
      </div>
    </div>
  );
}

function QuizTakingPanel({ unit, onClose }: { unit: LearningUnitView; onClose: () => void }) {
  const syncQuizProgressFor = useAcademyStore((state) => state.syncQuizProgressFor);
  const boot = useQuizBootstrap(unit);
  const { questions, session, setSession, displayedIndex, setDisplayedIndex } = boot;

  // boot.phaseが"ready"になって以降のみ意味を持つ内部フェーズ（完了表示の切り替え用）。
  const [localPhase, setLocalPhase] = useState<"in-progress" | "finished">("in-progress");
  const phase: QuizPhase =
    boot.phase === "loading" ? "loading" : boot.phase === "resume-dialog" ? "resume-dialog" : localPhase;
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [resultCount, setResultCount] = useState({ correct: 0, total: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  // 採点・進捗の更新は毎問サーバーに送らず、端末側に溜めてから「完了時」か
  // 「中断して閉じる」時にまとめて1回だけ同期する（通信待ちゼロでサクサク
  // 進められるようにするため。ユーザーヒアリング済み）。ブラウザが予期せず
  // 閉じられた場合、未同期分の進捗は失われる想定で合意済み。
  const pendingResultsRef = useRef<QuizAnswerResult[]>([]);
  const hasAnsweredCurrentRef = useRef(false);

  async function restartFromBeginning() {
    pendingResultsRef.current = [];
    await boot.restartFromBeginning();
  }

  // 端末内に溜まった採点結果をまとめて1回だけサーバーに送る。
  async function syncPending(): Promise<void> {
    if (pendingResultsRef.current.length === 0) return;
    const results = pendingResultsRef.current;
    pendingResultsRef.current = [];
    const nextSession = await syncQuizProgressFor(unit.id, results, questions.length);
    setSession(nextSession);
  }

  function submitAnswer() {
    // 二重タップでも同じ問題の採点が2回記録されないようにする。
    if (hasAnsweredCurrentRef.current) return;
    hasAnsweredCurrentRef.current = true;

    const question = questions[displayedIndex];
    const isCorrect = answerCorrectnessPolicy.isSatisfiedBy(inputValue, question.answer);
    pendingResultsRef.current.push({ isCorrect });
    setFeedback({ isCorrect, correctAnswer: question.answer });
    setResultCount((prev) => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
  }

  async function goToNext() {
    setFeedback(null);
    setInputValue("");
    hasAnsweredCurrentRef.current = false;

    const nextIndex = displayedIndex + 1;
    if (nextIndex >= questions.length) {
      setIsSyncing(true);
      try {
        await syncPending();
      } finally {
        setIsSyncing(false);
      }
      setLocalPhase("finished");
    } else {
      setDisplayedIndex(nextIndex);
    }
  }

  async function handleClose() {
    setIsSyncing(true);
    try {
      await syncPending();
    } finally {
      setIsSyncing(false);
    }
    onClose();
  }

  if (phase === "loading" || !session) {
    return <p className="text-xs opacity-70">読込中…</p>;
  }

  if (phase === "resume-dialog") {
    return (
      <QuizResumeDialog
        currentIndex={session.currentIndex}
        onResume={() => boot.setPhase("ready")}
        onRestart={() => void restartFromBeginning()}
        onClose={onClose}
      />
    );
  }

  if (phase === "finished") {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-house-primary/40 bg-house-primary/5 p-4 text-sm">
        <p className="font-display text-lg font-semibold">
          結果: {resultCount.correct} / {resultCount.total} 問正解
        </p>
        <button
          type="button"
          onClick={onClose}
          className="self-start rounded-md bg-house-primary px-3 py-1.5 text-xs font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
        >
          閉じる
        </button>
      </div>
    );
  }

  const question = questions[displayedIndex];
  const preset = QUIZ_CARD_PRESET_BY_QUESTION_TYPE[unit.questionType as QuestionType];
  const progressPercent = Math.round((displayedIndex / session.totalQuestions) * 100);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-house-primary/40 bg-house-primary/5 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => void handleClose()}
          disabled={isSyncing}
          aria-label="テストを閉じる"
          className="text-xs opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
        >
          ◀ 戻る
        </button>
        <span className="tabular-nums text-xs text-house-primary">
          {Math.min(displayedIndex + 1, session.totalQuestions)} / {session.totalQuestions}問
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-house-primary/20"
      >
        <div
          className="h-full rounded-full bg-house-accent transition-[width] motion-reduce:transition-none"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-xs opacity-85">{preset.instruction}</p>
      <HighlightedPrompt
        text={question.prompt}
        lang={preset.promptLang}
        highlightWhole={unit.questionType === "KanjiReading"}
      />

      {!feedback ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitAnswer();
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            lang={preset.answerLang}
            autoFocus
            className="rounded-md border border-house-primary/60 bg-transparent px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
            placeholder="答えを入力"
          />
          <button
            type="submit"
            disabled={inputValue.trim().length === 0}
            className="self-start rounded-md bg-house-primary px-3 py-1.5 text-xs font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
          >
            答える
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <p className={feedback.isCorrect ? "font-semibold text-house-accent" : "font-semibold opacity-85"}>
            {feedback.isCorrect ? "○ 正解！" : `✕ 不正解（正解: ${feedback.correctAnswer}）`}
          </p>
          <button
            type="button"
            onClick={() => void goToNext()}
            disabled={isSyncing}
            className="self-start rounded-md bg-house-primary px-3 py-1.5 text-xs font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
          >
            {isSyncing ? "保存中…" : "次へ"}
          </button>
        </div>
      )}
    </div>
  );
}

// 漢字の「書き」は手書きで確認するため入力欄を持たず、「正解を見る」→自己採点
// （覚えた／もう一度）という2ステップで進める。5問を1セットとし、セットの
// 区切りでのみサーバーへ同期する（セット内はスマホ内部の処理のみで0秒切り替え）。
const SELF_GRADED_SET_SIZE = 5;

type SetReviewItem = { question: QuestionView; isCorrect: boolean };
type SelfGradedSubPhase = "question" | "set-result" | "bonus-round" | "unit-finished";

function SelfGradedQuestionStep({
  question,
  revealed,
  onReveal,
  onGrade,
  disabled = false,
}: {
  question: QuestionView;
  revealed: boolean;
  onReveal: () => void;
  onGrade: (isCorrect: boolean) => void;
  disabled?: boolean;
}) {
  const preset = QUIZ_CARD_PRESET_BY_QUESTION_TYPE.KanjiWriting;
  return (
    <>
      <p className="text-xs opacity-85">{preset.instruction}</p>
      <HighlightedPrompt text={question.prompt} lang={preset.promptLang} />
      {!revealed ? (
        <button
          type="button"
          onClick={onReveal}
          disabled={disabled}
          className="mt-2 w-full rounded-md bg-house-primary px-4 py-4 text-base font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
        >
          正解を見る
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-display text-3xl font-semibold text-house-accent" lang="ja">
            {question.answer}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onGrade(true)}
              disabled={disabled}
              className="flex-1 rounded-md bg-house-primary px-3 py-3 text-sm font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
            >
              正解（覚えた！）
            </button>
            <button
              type="button"
              onClick={() => onGrade(false)}
              disabled={disabled}
              className="flex-1 rounded-md border border-house-primary/60 px-3 py-3 text-sm font-semibold hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
            >
              不正解（もう一度）
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SetReviewList({ items }: { items: SetReviewItem[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, index) => (
        <li
          key={item.question.id}
          className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs ${
            item.isCorrect ? "bg-house-primary/5" : "bg-house-accent/10"
          }`}
        >
          <span className="truncate">
            {index + 1}問目: {item.question.prompt}
            <span className="mx-1 opacity-60">➡</span>
            {item.question.answer}
          </span>
          <span aria-hidden="true">{item.isCorrect ? "🔴" : "🔵"}</span>
          <span className="sr-only">{item.isCorrect ? "正解" : "不正解"}</span>
        </li>
      ))}
    </ul>
  );
}

function SelfGradedQuizPanel({ unit, onClose }: { unit: LearningUnitView; onClose: () => void }) {
  const syncQuizProgressFor = useAcademyStore((state) => state.syncQuizProgressFor);
  const recordQuizAttemptsFor = useAcademyStore((state) => state.recordQuizAttemptsFor);
  const boot = useQuizBootstrap(unit);
  const { questions, session, setSession, displayedIndex, setDisplayedIndex } = boot;

  const [subPhase, setSubPhase] = useState<SelfGradedSubPhase>("question");
  const [revealed, setRevealed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [overallCount, setOverallCount] = useState({ correct: 0, total: 0 });
  const [setReview, setSetReview] = useState<SetReviewItem[]>([]);
  const pendingResultsRef = useRef<QuizAnswerResult[]>([]);
  const hasAnsweredCurrentRef = useRef(false);

  const [bonusQueue, setBonusQueue] = useState<QuestionView[]>([]);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [bonusRevealed, setBonusRevealed] = useState(false);
  const bonusResultsRef = useRef<QuizAnswerResult[]>([]);
  const [returnSubPhase, setReturnSubPhase] = useState<"set-result" | "unit-finished">("set-result");

  function resetForNewAttempt() {
    pendingResultsRef.current = [];
    setSetReview([]);
    setRevealed(false);
    setSubPhase("question");
  }

  async function restartFromBeginning() {
    resetForNewAttempt();
    setOverallCount({ correct: 0, total: 0 });
    await boot.restartFromBeginning();
  }

  function setBoundsFor(index: number) {
    const setStart = Math.floor(index / SELF_GRADED_SET_SIZE) * SELF_GRADED_SET_SIZE;
    const setEnd = Math.min(setStart + SELF_GRADED_SET_SIZE, questions.length);
    return { setStart, setEnd };
  }

  async function grade(isCorrect: boolean) {
    if (hasAnsweredCurrentRef.current) return;
    hasAnsweredCurrentRef.current = true;

    const question = questions[displayedIndex];
    pendingResultsRef.current.push({ isCorrect });
    setSetReview((prev) => [...prev, { question, isCorrect }]);
    setOverallCount((prev) => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));

    const { setEnd } = setBoundsFor(displayedIndex);
    const nextIndex = displayedIndex + 1;

    if (nextIndex >= setEnd) {
      setIsSyncing(true);
      try {
        const results = pendingResultsRef.current;
        pendingResultsRef.current = [];
        const nextSession = await syncQuizProgressFor(unit.id, results, questions.length);
        setSession(nextSession);
        setDisplayedIndex(nextIndex);
        setRevealed(false);
        setSubPhase(nextSession === null ? "unit-finished" : "set-result");
      } finally {
        setIsSyncing(false);
        hasAnsweredCurrentRef.current = false;
      }
    } else {
      setDisplayedIndex(nextIndex);
      setRevealed(false);
      hasAnsweredCurrentRef.current = false;
    }
  }

  async function handleCloseDuringSet() {
    setIsSyncing(true);
    try {
      if (pendingResultsRef.current.length > 0) {
        const results = pendingResultsRef.current;
        pendingResultsRef.current = [];
        await syncQuizProgressFor(unit.id, results, questions.length);
      }
    } finally {
      setIsSyncing(false);
    }
    onClose();
  }

  function startBonusRound(queue: QuestionView[], fromPhase: "set-result" | "unit-finished") {
    setBonusQueue(queue);
    setBonusIndex(0);
    setBonusRevealed(false);
    bonusResultsRef.current = [];
    setReturnSubPhase(fromPhase);
    setSubPhase("bonus-round");
  }

  async function gradeBonus(isCorrect: boolean) {
    if (hasAnsweredCurrentRef.current) return;
    hasAnsweredCurrentRef.current = true;
    bonusResultsRef.current.push({ isCorrect });

    const nextIndex = bonusIndex + 1;
    if (nextIndex >= bonusQueue.length) {
      const results = bonusResultsRef.current;
      bonusResultsRef.current = [];
      try {
        await recordQuizAttemptsFor(unit.id, results);
      } finally {
        setSubPhase(returnSubPhase);
        hasAnsweredCurrentRef.current = false;
      }
    } else {
      setBonusIndex(nextIndex);
      setBonusRevealed(false);
      hasAnsweredCurrentRef.current = false;
    }
  }

  if (boot.phase === "loading" || !session) {
    return <p className="text-xs opacity-70">読込中…</p>;
  }

  if (boot.phase === "resume-dialog") {
    return (
      <QuizResumeDialog
        currentIndex={session.currentIndex}
        onResume={() => {
          resetForNewAttempt();
          boot.setPhase("ready");
        }}
        onRestart={() => void restartFromBeginning()}
        onClose={onClose}
      />
    );
  }

  if (subPhase === "bonus-round") {
    const bonusQuestion = bonusQueue[bonusIndex];
    return (
      <div className="flex flex-col gap-3 rounded-md border border-house-primary/40 bg-house-primary/5 p-4 text-sm">
        <span className="tabular-nums text-xs text-house-primary">
          やり直し {bonusIndex + 1} / {bonusQueue.length}問
        </span>
        <SelfGradedQuestionStep
          question={bonusQuestion}
          revealed={bonusRevealed}
          onReveal={() => setBonusRevealed(true)}
          onGrade={(isCorrect) => void gradeBonus(isCorrect)}
        />
      </div>
    );
  }

  if (subPhase === "set-result" || subPhase === "unit-finished") {
    const setCorrect = setReview.filter((item) => item.isCorrect).length;
    const setTotal = setReview.length;
    const isPerfect = setCorrect === setTotal;
    const hasWrong = setCorrect < setTotal;
    const hasMoreSets = displayedIndex < questions.length;

    return (
      <div className="flex flex-col gap-4 rounded-md border border-house-primary/40 bg-house-primary/5 p-4 text-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-display text-2xl font-semibold motion-safe:animate-[pulse_0.6s_ease-in-out_1]">
            {setTotal}問中 {setCorrect}問 正解！
          </p>
          <p className="text-xs opacity-80">
            {subPhase === "unit-finished"
              ? `お疲れさまでした。全体: ${overallCount.correct} / ${overallCount.total}問正解`
              : isPerfect
                ? "たいへんよくできました！"
                : "どんまい！次がんばろう"}
          </p>
        </div>

        <SetReviewList items={setReview} />

        <div className="flex flex-col gap-2">
          {subPhase === "set-result" && hasMoreSets && (
            <button
              type="button"
              onClick={() => {
                setSetReview([]);
                setSubPhase("question");
              }}
              className="rounded-md bg-house-primary px-3 py-2 text-sm font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
            >
              次の5問に進む
            </button>
          )}
          {hasWrong && (
            <button
              type="button"
              onClick={() =>
                startBonusRound(
                  setReview.filter((item) => !item.isCorrect).map((item) => item.question),
                  subPhase,
                )
              }
              className="rounded-md border border-house-primary/60 px-3 py-2 text-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
            >
              間違えた問題だけをやり直す
            </button>
          )}
          <button
            type="button"
            onClick={() => startBonusRound(setReview.map((item) => item.question), subPhase)}
            className="rounded-md border border-house-primary/60 px-3 py-2 text-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            もう一度この5問を解く
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            テスト選択へ戻る
          </button>
        </div>
      </div>
    );
  }

  const question = questions[displayedIndex];
  const { setStart, setEnd } = setBoundsFor(displayedIndex);
  const setSize = setEnd - setStart;
  const positionInSet = displayedIndex - setStart + 1;
  const progressPercent = Math.round(((positionInSet - 1) / setSize) * 100);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-house-primary/40 bg-house-primary/5 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => void handleCloseDuringSet()}
          disabled={isSyncing}
          aria-label="テストを閉じる"
          className="text-xs opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
        >
          ◀ 戻る
        </button>
        <div className="text-right">
          <span className="tabular-nums text-xs text-house-primary">
            {positionInSet} / {setSize}問
          </span>
          <p className="text-[10px] opacity-60">
            全{questions.length}問中{displayedIndex + 1}問目
          </p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-house-primary/20"
      >
        <div
          className="h-full rounded-full bg-house-accent transition-[width] motion-reduce:transition-none"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <SelfGradedQuestionStep
        question={question}
        revealed={revealed}
        onReveal={() => setRevealed(true)}
        onGrade={(isCorrect) => void grade(isCorrect)}
        disabled={isSyncing}
      />

      {isSyncing && <p className="text-xs opacity-70">保存中…</p>}
    </div>
  );
}

function LearningUnitRow({
  unit,
  onRecordAttempt,
  onFetchQuestions,
}: {
  unit: LearningUnitView;
  onRecordAttempt: (learningUnitId: string, isCorrect: boolean) => void;
  onFetchQuestions: (learningUnitId: string) => Promise<QuestionView[]>;
}) {
  const [questions, setQuestions] = useState<QuestionView[] | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);

  async function toggleQuestions() {
    if (questions) {
      setQuestions(null);
      return;
    }
    setIsLoadingQuestions(true);
    try {
      setQuestions(await onFetchQuestions(unit.id));
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-house-primary/30 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p>
            {unit.title}
            {unit.questionType && (
              <span className="ml-2 rounded-full bg-house-primary/20 px-2 py-0.5 text-xs text-house-primary">
                {QUESTION_TYPE_LABEL[unit.questionType]}
              </span>
            )}
          </p>
          <p className="text-xs opacity-70">
            理解度 {unit.understandingRate}%・難易度{" "}
            <span aria-label={`難易度 ${unit.difficulty}`}>
              {"★".repeat(unit.difficulty)}
              {"☆".repeat(5 - unit.difficulty)}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {unit.questionType && (
            <button
              type="button"
              onClick={() => setIsTakingQuiz((prev) => !prev)}
              className="rounded-md bg-house-accent px-2 py-1 text-xs font-semibold text-house-bg hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
            >
              {isTakingQuiz ? "テストを閉じる" : "テストを受ける"}
            </button>
          )}
          {unit.questionType && (
            <button
              type="button"
              onClick={() => void toggleQuestions()}
              disabled={isLoadingQuestions}
              className="rounded-md border border-house-primary/60 px-2 py-1 text-xs hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
            >
              {isLoadingQuestions ? "読込中…" : questions ? "問題を閉じる" : "問題を見る"}
            </button>
          )}
          {!unit.questionType && (
            <span className="rounded-full bg-house-primary/10 px-2 py-0.5 text-xs opacity-60">準備中</span>
          )}
        </div>
      </div>

      {isTakingQuiz && unit.questionType && (
        <div className="border-t border-house-primary/20 pt-3">
          {unit.questionType === "KanjiWriting" ? (
            <SelfGradedQuizPanel unit={unit} onClose={() => setIsTakingQuiz(false)} />
          ) : (
            <QuizTakingPanel unit={unit} onClose={() => setIsTakingQuiz(false)} />
          )}
        </div>
      )}

      {questions && unit.questionType && (
        <div className="flex flex-col gap-3 border-t border-house-primary/20 pt-3">
          {questions.length === 0 ? (
            <p className="text-xs opacity-70">この単元の問題はまだ登録されていません。</p>
          ) : (
            questions.map((question, index) => (
              <QuizCard
                key={question.id}
                {...QUIZ_CARD_PRESET_BY_QUESTION_TYPE[unit.questionType as QuestionType]}
                prompt={question.prompt}
                answer={question.answer}
                number={index + 1}
                total={questions.length}
                onGrade={(grade) => onRecordAttempt(unit.id, grade === "correct")}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AbilityBar({ subject, level }: { subject: Subject; level: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span>{SUBJECT_LABEL[subject]}</span>
        <span className="tabular-nums text-house-primary">{level}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-house-primary/20">
        <div
          className="h-full rounded-full bg-house-primary transition-[width]"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

function ExamCountdown({ scheduledDate }: { scheduledDate: Date }) {
  const [now] = useState(() => Date.now());
  const daysLeft = Math.ceil((scheduledDate.getTime() - now) / (1000 * 60 * 60 * 24));
  const urgency =
    daysLeft <= 3 ? "critical" : daysLeft <= 7 ? "urgent" : daysLeft <= 14 ? "warning" : "calm";
  const ringClassByUrgency: Record<typeof urgency, string> = {
    calm: "border-house-primary/40",
    warning: "border-house-primary",
    urgent: "border-house-accent shadow-[0_0_16px_var(--house-accent)]",
    critical:
      "border-house-accent shadow-[0_0_24px_var(--house-accent)] animate-pulse motion-reduce:animate-none",
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-20 w-20 flex-none items-center justify-center rounded-full border-4 transition-shadow ${ringClassByUrgency[urgency]}`}
      >
        <span className="font-display text-2xl font-bold tabular-nums">{Math.max(daysLeft, 0)}</span>
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-house-primary">魔導評価への秒読み</p>
        <p className="text-sm">
          {daysLeft > 0 ? `あと${daysLeft}日` : daysLeft === 0 ? "本日実施" : "実施済み"}
        </p>
      </div>
    </div>
  );
}

function HomeTab({
  overview,
  unitById,
  onAssignDaily,
  onOfferMock,
}: {
  overview: CultivationOverview;
  unitById: Map<string, LearningUnitView>;
  onAssignDaily: () => void;
  onOfferMock: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {overview.upcomingExam && (
        <GrimoireCard
          title={
            <span className="flex items-center gap-2">
              <TabIcon name="great-hall" size={24} /> 大広間
            </span>
          }
        >
          <ExamCountdown scheduledDate={overview.upcomingExam.scheduledDate} />
        </GrimoireCard>
      )}

      <GrimoireCard title="本日のデイリークエスト">
        <div className="flex flex-col gap-3">
          {overview.dailyMission ? (
            <div className="flex flex-col gap-1">
              {overview.dailyMission.targetLearningUnitIds.map((id) => {
                const unit = unitById.get(id);
                return (
                  <p key={id} className="text-sm">
                    {unit ? `${SUBJECT_ELEMENT[unit.subject]}の修練: 「${unit.title}」に挑め` : id}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-sm opacity-80">まだ任務が発令されていません。</p>
          )}
          <button
            type="button"
            onClick={onAssignDaily}
            className="rounded-md border border-house-primary px-3 py-1.5 text-sm font-semibold text-house-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            デイリークエストを発令する
          </button>
        </div>
      </GrimoireCard>

      <GrimoireCard title="次なる試練 予想問題ミッション">
        <div className="flex flex-col gap-3">
          {overview.mockExamMission ? (
            <p className="text-sm">対象単元数: {overview.mockExamMission.targetLearningUnitIds.length}件</p>
          ) : (
            <p className="text-sm opacity-80">まだ提示されていません。</p>
          )}
          <button
            type="button"
            onClick={onOfferMock}
            className="rounded-md border border-house-primary px-3 py-1.5 text-sm font-semibold text-house-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            予想問題ミッションを選択する
          </button>
        </div>
      </GrimoireCard>
    </div>
  );
}

function LibraryTab({
  overview,
  selectedSubject,
  onSelectSubject,
  onRecordAttempt,
  onFetchQuestions,
}: {
  overview: CultivationOverview;
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject | null) => void;
  onRecordAttempt: (learningUnitId: string, isCorrect: boolean) => void;
  onFetchQuestions: (learningUnitId: string) => Promise<QuestionView[]>;
}) {
  if (!selectedSubject) {
    return (
      <GrimoireCard
        title={
          <span className="flex items-center gap-2">
            <TabIcon name="grimoire-library" size={24} /> 魔導書庫
          </span>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUBJECTS.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => onSelectSubject(subject)}
              className="flex flex-col items-start gap-1 rounded-md border border-house-primary/50 p-3 text-left transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
            >
              <span className="flex items-center gap-2 text-house-accent">
                <TabIcon name={SUBJECT_ICON[subject]} size={28} />
                <span className="font-display font-semibold text-house-text">{SUBJECT_ELEMENT[subject]}</span>
              </span>
              <span className="text-xs opacity-70">{SUBJECT_LABEL[subject]}</span>
            </button>
          ))}
        </div>
      </GrimoireCard>
    );
  }

  const ability = overview.abilities.find((a) => a.subject === selectedSubject);
  const units = overview.units.filter((unit) => unit.subject === selectedSubject);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => onSelectSubject(null)}
        className="self-start text-sm text-house-primary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
      >
        ← 書庫に戻る
      </button>

      <GrimoireCard
        title={
          <span className="flex items-center gap-2">
            <TabIcon name={SUBJECT_ICON[selectedSubject]} size={24} />
            {SUBJECT_ELEMENT[selectedSubject]}（{SUBJECT_LABEL[selectedSubject]}）
          </span>
        }
      >
        {ability && <AbilityBar subject={ability.subject} level={ability.level} />}
      </GrimoireCard>

      <GrimoireCard title="頻出の魔法陣演習">
        <div className="flex flex-col gap-2">
          {units.length === 0 ? (
            <p className="text-sm opacity-70">この属性の単元はまだありません。</p>
          ) : (
            units.map((unit) => (
              <LearningUnitRow
                key={unit.id}
                unit={unit}
                onRecordAttempt={onRecordAttempt}
                onFetchQuestions={onFetchQuestions}
              />
            ))
          )}
        </div>
      </GrimoireCard>
    </div>
  );
}

function TowerTab({
  units,
  filter,
  onFilterChange,
  onRecordAttempt,
  onFetchQuestions,
}: {
  units: LearningUnitView[];
  filter: Subject | "all";
  onFilterChange: (filter: Subject | "all") => void;
  onRecordAttempt: (learningUnitId: string, isCorrect: boolean) => void;
  onFetchQuestions: (learningUnitId: string) => Promise<QuestionView[]>;
}) {
  const filtered = filter === "all" ? units : units.filter((unit) => unit.subject === filter);
  const phantoms = filtered.filter(
    (unit) => unit.attemptCount > 0 && unit.understandingRate < WEAK_UNDERSTANDING_THRESHOLD,
  );

  return (
    <div className="flex flex-col gap-4">
      <GrimoireCard
        title={
          <span className="flex items-center gap-2">
            <TabIcon name="phantom-tower" size={24} /> 幻影の塔
          </span>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              aria-pressed={filter === "all"}
              className={`rounded-md border px-2 py-1 text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
                filter === "all"
                  ? "border-house-primary bg-house-primary text-house-on-primary"
                  : "border-house-primary/50 text-house-primary"
              }`}
            >
              全属性
            </button>
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => onFilterChange(subject)}
                aria-pressed={filter === subject}
                className={`rounded-md border px-2 py-1 text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
                  filter === subject
                    ? "border-house-primary bg-house-primary text-house-on-primary"
                    : "border-house-primary/50 text-house-primary"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <TabIcon name={SUBJECT_ICON[subject]} size={16} /> {SUBJECT_ELEMENT[subject]}
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm opacity-85">
            {phantoms.length === 0
              ? "幻影は残っていません。塔は浄化されました。"
              : `${phantoms.length}体のニガテの幻影が残っています。`}
          </p>
        </div>
      </GrimoireCard>

      {phantoms.length > 0 && (
        <div className="flex flex-col gap-2">
          {phantoms.map((unit) => (
            <LearningUnitRow
              key={unit.id}
              unit={unit}
              onRecordAttempt={onRecordAttempt}
              onFetchQuestions={onFetchQuestions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AcademyPage() {
  const {
    house,
    isEnrolled,
    overview,
    refreshOverview,
    recordAttemptFor,
    assignDailyMission,
    offerMockExam,
    fetchQuestions,
  } = useAcademyStore();

  const [tab, setTab] = useState<Tab>("hall");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [towerFilter, setTowerFilter] = useState<Subject | "all">("all");

  useEffect(() => {
    if (isEnrolled) {
      void refreshOverview();
    }
  }, [isEnrolled, refreshOverview]);

  if (!isEnrolled || !overview) {
    return (
      <ThemeProvider house={house ?? "RegiusCardis"}>
        <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-house-bg p-8 text-house-text">
          <p className="text-sm">まだ学舎割当が行われていません。</p>
          <Link
            href="/"
            className="text-sm font-semibold text-house-primary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            ← 鑑定画面に戻る
          </Link>
        </div>
      </ThemeProvider>
    );
  }

  const unitById = new Map(overview.units.map((unit) => [unit.id, unit]));
  const onRecordAttempt = (id: string, isCorrect: boolean) => void recordAttemptFor(id, isCorrect);
  const phantomCount = overview.units.filter(
    (unit) => unit.attemptCount > 0 && unit.understandingRate < WEAK_UNDERSTANDING_THRESHOLD,
  ).length;

  return (
    <ThemeProvider house={house ?? "RegiusCardis"}>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 bg-house-bg p-8 text-house-text">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">修練場</h1>
            <p className="text-xs opacity-80">{GRADE_LABEL[overview.grade]}</p>
          </div>
          <Link
            href="/"
            className="text-sm text-house-primary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            ← 鑑定画面
          </Link>
        </div>

        <TabBar
          value={tab}
          onChange={(id) => setTab(id as Tab)}
          badges={phantomCount > 0 ? { tower: phantomCount } : undefined}
          className="rounded-md"
        />

        {tab === "hall" && (
          <HomeTab
            overview={overview}
            unitById={unitById}
            onAssignDaily={() => void assignDailyMission()}
            onOfferMock={() => void offerMockExam()}
          />
        )}

        {tab === "library" && (
          <LibraryTab
            overview={overview}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onRecordAttempt={onRecordAttempt}
            onFetchQuestions={fetchQuestions}
          />
        )}

        {tab === "tower" && (
          <TowerTab
            units={overview.units}
            filter={towerFilter}
            onFilterChange={setTowerFilter}
            onRecordAttempt={onRecordAttempt}
            onFetchQuestions={fetchQuestions}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
