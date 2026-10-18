"use client";

import Link from "next/link";
import { useState } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GrimoireCard } from "@/components/ui/GrimoireCard";
import { MagicalToggle } from "@/components/ui/MagicalToggle";
import type { Grade } from "@/contexts/mana-cultivation/domain/models/Grade";
import { LAUNCHED_GRADES } from "@/contexts/mana-cultivation/domain/specs/GradeExamTypePolicy";
import { useAcademyStore } from "@/stores/useAcademyStore";

const HOUSE_LABEL = {
  RegiusCardis: "レギウス・カルディス",
  RoseSleep: "ローズスリープ",
} as const;

const GRADE_LABEL: Record<Grade, string> = {
  Pre: "プレ期間（小6）",
  First: "ファーストグレード（中1）",
  Second: "セカンドグレード（中2）",
  Third: "サードグレード（中3）",
  Fourth: "フォースグレード（高1）",
  Fifth: "フィフスグレード（高2）",
  Sixth: "シックスグレード（高3）",
};

function ManaQualitySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-house-primary">{value}</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ accentColor: "var(--house-primary)" }}
        className="h-2 w-full cursor-pointer rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
      />
    </label>
  );
}

export default function Home() {
  const { house, isEnrolled, isLoading, error, enroll } = useAcademyStore();
  const [order, setOrder] = useState(50);
  const [chaos, setChaos] = useState(50);
  const [amount, setAmount] = useState(50);
  const [grade, setGrade] = useState<Grade>(LAUNCHED_GRADES[0]);

  return (
    <ThemeProvider house={house ?? "RegiusCardis"}>
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-house-bg p-8 text-house-text">
        <h1 className="font-display text-2xl">Advisaria Magica Academy</h1>

        <GrimoireCard title="魔力資質の鑑定">
          <div className="flex w-72 max-w-full flex-col gap-4">
            <p className="text-sm">
              学年段階・秩序度・混沌度・魔力量を入力し、配属される学舎を鑑定します。
            </p>

            <fieldset className="flex flex-col gap-1 text-sm">
              <legend className="mb-1">学年段階</legend>
              <div className="flex gap-2">
                {LAUNCHED_GRADES.map((candidate) => (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => setGrade(candidate)}
                    aria-pressed={grade === candidate}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
                      grade === candidate
                        ? "border-house-primary bg-house-primary text-house-on-primary"
                        : "border-house-primary/50 text-house-primary hover:opacity-80"
                    }`}
                  >
                    {GRADE_LABEL[candidate]}
                  </button>
                ))}
              </div>
            </fieldset>

            <ManaQualitySlider label="秩序度" value={order} onChange={setOrder} />
            <ManaQualitySlider label="混沌度" value={chaos} onChange={setChaos} />
            <ManaQualitySlider label="魔力量" value={amount} onChange={setAmount} />

            <button
              type="button"
              disabled={isLoading}
              onClick={() => enroll({ order, chaos, amount }, grade)}
              className="mt-2 rounded-md bg-house-primary px-4 py-2 text-sm font-semibold text-house-on-primary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
            >
              {isLoading ? "鑑定中…" : "鑑定する"}
            </button>

            {error && <p className="text-sm text-house-accent">{error}</p>}

            {isEnrolled && house && (
              <div className="flex flex-col gap-2 border-t border-house-primary/40 pt-4">
                <p className="text-sm">
                  配属学舎: <span className="font-display text-house-primary">{HOUSE_LABEL[house]}</span>
                </p>
                <Link
                  href="/academy"
                  className="text-center text-sm font-semibold text-house-primary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
                >
                  修練場へ進む →
                </Link>
              </div>
            )}
          </div>
        </GrimoireCard>

        <MagicalToggle label="通知を受け取る" />
      </div>
    </ThemeProvider>
  );
}
