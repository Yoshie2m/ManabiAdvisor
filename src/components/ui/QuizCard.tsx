"use client";

import { useId, useState, type ReactNode } from "react";

import { GrimoireCard } from "./GrimoireCard";

export type QuizKind = "vocabulary" | "ja-translation" | "en-translation" | "math";
export type QuizGrade = "correct" | "again";

type QuizCardLabels = Partial<
  Record<"reveal" | "hide" | "correct" | "again" | "hint" | "answer" | "alternatives", string>
>;

type QuizCardProps = {
  kind: QuizKind;
  prompt: ReactNode;
  answer: ReactNode;
  reading?: string;
  partOfSpeech?: string;
  example?: { sentence: ReactNode; translation?: ReactNode };
  alternatives?: ReactNode[];
  steps?: ReactNode[];
  hint?: ReactNode;
  explanation?: ReactNode;
  number?: number;
  total?: number;
  revealed?: boolean;
  defaultRevealed?: boolean;
  onReveal?: (revealed: boolean) => void;
  onGrade?: (grade: QuizGrade) => void;
  grade?: QuizGrade | null;
  chapter?: ReactNode;
  instruction?: ReactNode;
  footer?: ReactNode;
  labels?: QuizCardLabels;
  promptLang?: string;
  answerLang?: string;
};

const QUIZ_KIND_DEFAULTS: Record<
  QuizKind,
  { chapter: string; instruction: string; promptLang: string; answerLang: string }
> = {
  vocabulary: {
    chapter: "Vocabulary · 単語帳",
    instruction: "この単語の意味を答えなさい。",
    promptLang: "en",
    answerLang: "ja",
  },
  "ja-translation": {
    chapter: "Translation · 英文和訳",
    instruction: "次の英文を日本語に訳しなさい。",
    promptLang: "en",
    answerLang: "ja",
  },
  "en-translation": {
    chapter: "Translation · 和文英訳",
    instruction: "次の日本文を英語に訳しなさい。",
    promptLang: "ja",
    answerLang: "en",
  },
  math: {
    chapter: "Mathematics · 例題",
    instruction: "次の問題を解きなさい。",
    promptLang: "ja",
    answerLang: "ja",
  },
};

export function QuizCard({
  kind,
  prompt,
  answer,
  reading,
  partOfSpeech,
  example,
  alternatives,
  steps,
  hint,
  explanation,
  number,
  total,
  revealed,
  defaultRevealed = false,
  onReveal,
  onGrade,
  grade: gradeProp,
  chapter,
  instruction,
  footer,
  labels = {},
  promptLang,
  answerLang,
}: QuizCardProps) {
  const defaults = QUIZ_KIND_DEFAULTS[kind];

  const isRevealControlled = revealed !== undefined;
  const [internalRevealed, setInternalRevealed] = useState(defaultRevealed);
  const open = isRevealControlled ? revealed : internalRevealed;

  const isGradeControlled = gradeProp !== undefined;
  const [internalGrade, setInternalGrade] = useState<QuizGrade | null>(null);
  const grade = isGradeControlled ? gradeProp : internalGrade;

  const answerId = `${useId()}-answer`;
  const resolvedPromptLang = promptLang ?? defaults.promptLang;
  const resolvedAnswerLang = answerLang ?? defaults.answerLang;

  function toggleRevealed() {
    const next = !open;
    if (!isRevealControlled) {
      setInternalRevealed(next);
    }
    onReveal?.(next);
  }

  function selectGrade(next: QuizGrade) {
    if (!isGradeControlled) {
      setInternalGrade(next);
    }
    onGrade?.(next);
  }

  let question: ReactNode;
  if (kind === "vocabulary") {
    const meta = [reading, partOfSpeech].filter(Boolean).join("　");
    question = (
      <div className="flex flex-col gap-1">
        <p className="font-display text-2xl font-semibold tracking-wide" lang={resolvedPromptLang}>
          {prompt}
        </p>
        {meta && (
          <p className="text-xs text-house-accent" lang={resolvedPromptLang}>
            {meta}
          </p>
        )}
      </div>
    );
  } else if (kind === "math") {
    question = (
      <p className="text-lg tabular-nums" lang={resolvedPromptLang}>
        {prompt}
      </p>
    );
  } else {
    question = (
      <p className="text-lg" lang={resolvedPromptLang}>
        {prompt}
      </p>
    );
  }

  const footerContent =
    footer !== undefined ? footer : number != null ? `Question ${number}${total != null ? ` / ${total}` : ""}` : undefined;

  return (
    <GrimoireCard title={chapter !== undefined ? chapter : defaults.chapter} footer={footerContent}>
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-xs opacity-85">{instruction !== undefined ? instruction : defaults.instruction}</p>

        {question}

        {hint && !open && (
          <details className="text-sm">
            <summary className="cursor-pointer font-display text-xs font-semibold tracking-wider text-house-accent uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus">
              {labels.hint || "Hint · ヒント"}
            </summary>
            <p className="mt-1">{hint}</p>
          </details>
        )}

        {open && (
          <div
            id={answerId}
            role="region"
            aria-label={labels.answer || "解答"}
            className="quiz-answer flex flex-col gap-2 border-t border-house-primary/30 pt-3"
          >
            <p className="font-display text-xs font-semibold tracking-wider text-house-accent uppercase">
              {labels.answer || "Answer · 解答"}
            </p>

            {kind === "math" && steps && steps.length > 0 && (
              <ol className="list-inside list-decimal pl-4 text-sm">
                {steps.map((step, index) => (
                  <li key={index} className="marker:font-semibold marker:text-house-accent">
                    {step}
                  </li>
                ))}
              </ol>
            )}

            <p className="text-lg font-semibold" lang={resolvedAnswerLang}>
              {answer}
            </p>

            {alternatives && alternatives.length > 0 && (
              <p className="text-sm opacity-85" lang={resolvedAnswerLang}>
                <b className="font-semibold opacity-100">{labels.alternatives || "別解"}：</b>
                {alternatives.map((alternative, index) => (
                  <span key={index}>
                    {index > 0 && " ／ "}
                    {alternative}
                  </span>
                ))}
              </p>
            )}

            {example && (
              <p className="text-sm opacity-85">
                <span lang="en">{example.sentence}</span>
                {example.translation && (
                  <>
                    <br />
                    {example.translation}
                  </>
                )}
              </p>
            )}

            {explanation && <p className="text-sm opacity-85">{explanation}</p>}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={answerId}
            onClick={toggleRevealed}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-opacity motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
              open
                ? "border-house-primary/60 hover:opacity-80"
                : "border-house-primary bg-house-primary text-house-on-primary hover:opacity-90"
            }`}
          >
            {open ? labels.hide || "解答を閉じる" : labels.reveal || "解答を開く"}
          </button>

          {open && onGrade && (
            <>
              <button
                type="button"
                aria-pressed={grade === "correct"}
                onClick={() => selectGrade("correct")}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-opacity motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
                  grade === "correct"
                    ? "border-house-accent bg-house-accent text-house-bg"
                    : "border-house-primary/60 hover:opacity-80"
                }`}
              >
                {labels.correct || "覚えた"}
              </button>
              <button
                type="button"
                aria-pressed={grade === "again"}
                onClick={() => selectGrade("again")}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-opacity motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
                  grade === "again"
                    ? "border-house-accent bg-house-accent text-house-bg"
                    : "border-house-primary/60 hover:opacity-80"
                }`}
              >
                {labels.again || "もう一度"}
              </button>
            </>
          )}
        </div>
      </div>
    </GrimoireCard>
  );
}
