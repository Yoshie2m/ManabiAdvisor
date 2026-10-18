"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GrimoireCard } from "@/components/ui/GrimoireCard";
import type { Grade } from "@/contexts/mana-cultivation/domain/models/Grade";
import type { QuestionType } from "@/contexts/mana-cultivation/domain/models/QuestionType";
import type { Subject } from "@/contexts/mana-cultivation/domain/models/Subject";
import type { LearningUnitView } from "@/contexts/mana-cultivation/usecase/GetCultivationOverview/GetCultivationOverview";
import { useAcademyStore, type QuestionView } from "@/stores/useAcademyStore";

const SUBJECT_LABEL: Record<Subject, string> = {
  English: "英語",
  Math: "数学",
  Japanese: "国語",
  Science: "理科",
  SocialStudies: "社会",
};

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  VocabularyTest: "単語テスト",
  PassageTranslationToJapanese: "本文の和訳",
  PassageTranslationToEnglish: "英訳問題",
  Calculation: "計算問題",
  WordProblem: "文章題",
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

function LearningUnitRow({
  unit,
  onRecordAttempt,
  onComplete,
  onFetchQuestions,
}: {
  unit: LearningUnitView;
  onRecordAttempt: (learningUnitId: string, isCorrect: boolean) => void;
  onComplete: (learningUnitId: string) => void;
  onFetchQuestions: (learningUnitId: string) => Promise<QuestionView[]>;
}) {
  const [questions, setQuestions] = useState<QuestionView[] | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

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
              onClick={() => void toggleQuestions()}
              disabled={isLoadingQuestions}
              className="rounded-md border border-house-primary/60 px-2 py-1 text-xs hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
            >
              {isLoadingQuestions ? "読込中…" : questions ? "問題を閉じる" : "問題を見る"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onRecordAttempt(unit.id, true)}
            className="rounded-md border border-house-primary/60 px-2 py-1 text-xs hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            正解
          </button>
          <button
            type="button"
            onClick={() => onRecordAttempt(unit.id, false)}
            className="rounded-md border border-house-primary/60 px-2 py-1 text-xs hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            不正解
          </button>
          <button
            type="button"
            onClick={() => onComplete(unit.id)}
            className="rounded-md bg-house-primary px-2 py-1 text-xs font-semibold text-house-on-primary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          >
            単元完了 (+5)
          </button>
        </div>
      </div>

      {questions && (
        <div className="flex flex-col gap-2 border-t border-house-primary/20 pt-2">
          {questions.length === 0 ? (
            <p className="text-xs opacity-70">この単元の問題はまだ登録されていません。</p>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="text-xs">
                <p>{question.prompt}</p>
                <p className="opacity-70">答え: {question.answer}</p>
              </div>
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

export default function AcademyPage() {
  const {
    house,
    isEnrolled,
    overview,
    refreshOverview,
    completeUnit,
    recordAttemptFor,
    assignDailyMission,
    offerMockExam,
    fetchQuestions,
  } = useAcademyStore();

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
  const unitsBySubject = new Map<Subject, typeof overview.units>();
  for (const unit of overview.units) {
    unitsBySubject.set(unit.subject, [...(unitsBySubject.get(unit.subject) ?? []), unit]);
  }

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

        <GrimoireCard title="科目別能力">
          <div className="flex flex-col gap-3">
            {overview.abilities.map((ability) => (
              <AbilityBar key={ability.subject} subject={ability.subject} level={ability.level} />
            ))}
          </div>
        </GrimoireCard>

        <GrimoireCard title="ミッション">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-sm font-semibold text-house-primary">デイリーミッション</p>
              {overview.dailyMission ? (
                <p className="text-sm">
                  おすすめ単元:{" "}
                  {overview.dailyMission.targetLearningUnitIds
                    .map((id) => unitById.get(id)?.title ?? id)
                    .join("、")}
                </p>
              ) : (
                <p className="text-sm opacity-80">まだ生成されていません。</p>
              )}
              <button
                type="button"
                onClick={() => void assignDailyMission()}
                className="mt-2 rounded-md border border-house-primary px-3 py-1.5 text-sm font-semibold text-house-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
              >
                デイリーミッションを生成
              </button>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-house-primary">次テスト範囲 予想問題ミッション</p>
              {overview.mockExamMission ? (
                <p className="text-sm">
                  対象単元数: {overview.mockExamMission.targetLearningUnitIds.length}件
                </p>
              ) : (
                <p className="text-sm opacity-80">まだ提示されていません。</p>
              )}
              <button
                type="button"
                onClick={() => void offerMockExam()}
                className="mt-2 rounded-md border border-house-primary px-3 py-1.5 text-sm font-semibold text-house-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
              >
                予想問題ミッションを選択する
              </button>
            </div>
          </div>
        </GrimoireCard>

        <GrimoireCard title="学習ユニット">
          <div className="flex flex-col gap-5">
            {[...unitsBySubject.entries()].map(([subject, units]) => (
              <div key={subject} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-house-primary">{SUBJECT_LABEL[subject]}</p>
                {units.map((unit) => (
                  <LearningUnitRow
                    key={unit.id}
                    unit={unit}
                    onRecordAttempt={(id, isCorrect) => void recordAttemptFor(id, isCorrect)}
                    onComplete={(id) => void completeUnit(id)}
                    onFetchQuestions={fetchQuestions}
                  />
                ))}
              </div>
            ))}
          </div>
        </GrimoireCard>
      </div>
    </ThemeProvider>
  );
}
