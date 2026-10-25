"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// デザインシステムの GoalCard。左に試験日と残り日数、右に準備状態のドーナツメーター、下に次のタスクを1つ。
type Tier = { id: "calm" | "focus" | "push" | "final"; word: string };

function tierOf(days: number): Tier {
  if (days <= 3) return { id: "final", word: "ラストスパート" };
  if (days <= 7) return { id: "push", word: "加速" };
  if (days <= 14) return { id: "focus", word: "集中" };
  return { id: "calm", word: "計画的に" };
}

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
}

type GoalCardProps = {
  examName: string;
  examDate: Date;
  progress: number;
  nextTask?: string;
  onTaskClick?: () => void;
};

export function GoalCard({ examName, examDate, progress, nextTask, onTaskClick }: GoalCardProps) {
  const days = daysUntil(examDate);
  const tier = tierOf(days);
  const percent = Math.max(0, Math.min(100, Math.round(progress)));
  const level = Math.floor(percent / 10);
  const previousLevel = useRef(level);
  const [celebration, setCelebration] = useState(0);

  useEffect(() => {
    if (level > previousLevel.current) {
      setCelebration((count) => count + 1);
    }
    previousLevel.current = level;
  }, [level]);

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(0), 1800);
    return () => clearTimeout(timer);
  }, [celebration]);

  const dateLabel = `${examDate.getMonth() + 1}/${examDate.getDate()}`;
  const daysLabel = days > 0 ? `あと${days}日` : days === 0 ? "本日" : "終了";

  return (
    <section
      className={`goal-card goal-card--${tier.id} flex flex-col gap-2 rounded-lg border border-house-primary/40 bg-house-bg px-6 py-4 text-house-text`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-xs leading-[18px] opacity-70">
            {dateLabel} {examName}
          </p>
          <p
            aria-label={daysLabel}
            className="goal-days flex items-baseline gap-1 font-extrabold tabular-nums text-[var(--goal-tone)]"
          >
            {days > 0 ? (
              <>
                <span className="text-lg leading-6 font-bold">あと</span>
                <span className="text-[56px] leading-[56px] tracking-[-0.02em]">{days}</span>
                <span className="text-lg leading-6 font-bold">日</span>
              </>
            ) : (
              <span className="text-[40px] leading-[48px]">{days === 0 ? "本日" : "終了"}</span>
            )}
          </p>
          {days >= 0 && (
            <span className="mt-0.5 self-start rounded-md border border-[var(--goal-tone)] px-2 text-[11px] leading-4 font-bold text-[var(--goal-tone)]">
              {tier.word}
            </span>
          )}
        </div>
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="準備状態"
          style={{ "--goal-p": `${percent}%` } as CSSProperties}
          className={`goal-meter relative grid h-[104px] w-[104px] flex-none place-items-center ${celebration ? "is-levelup" : ""}`}
        >
          <span className="goal-ring" aria-hidden="true" />
          <span className="relative text-[26px] leading-7 font-extrabold tabular-nums">
            {percent}
            <small className="ml-px text-[13px] font-bold">%</small>
          </span>
          <span key={`sparkle-${celebration}`} className="goal-sparkle" aria-hidden="true" />
          {celebration ? (
            <span
              role="status"
              className="goal-cheer absolute -top-2.5 -right-2 rounded-md bg-[var(--dex-meta)] px-2 text-[11px] leading-4 font-extrabold whitespace-nowrap text-house-bg"
            >
              Good Job!
            </span>
          ) : null}
        </div>
      </div>
      {nextTask && (
        <div className="flex min-w-0 items-baseline gap-2 border-t border-house-primary/30 pt-2 text-sm leading-[22px]">
          <span className="flex-none text-[11px] leading-4 font-bold text-[var(--dex-meta)]">次のタスク：</span>
          {onTaskClick ? (
            <button
              type="button"
              onClick={onTaskClick}
              className="min-w-0 truncate text-left underline decoration-house-primary/40 underline-offset-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
            >
              {nextTask}
            </button>
          ) : (
            <span className="min-w-0 truncate">{nextTask}</span>
          )}
        </div>
      )}
    </section>
  );
}
