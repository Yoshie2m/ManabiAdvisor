"use client";

import Link from "next/link";
import { useState } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GrimoireCard } from "@/components/ui/GrimoireCard";
import { MagicalToggle } from "@/components/ui/MagicalToggle";
import { HOUSES, type House } from "@/contexts/house-assignment/domain/models/House";
import type { Grade } from "@/contexts/mana-cultivation/domain/models/Grade";
import { LAUNCHED_GRADES } from "@/contexts/mana-cultivation/domain/specs/GradeExamTypePolicy";
import { useAcademyStore } from "@/stores/useAcademyStore";

const HOUSE_LABEL: Record<House, string> = {
  RegiusCardis: "レギウス・カルディス",
  RoseSleep: "ローズスリープ",
};

const HOUSE_DESCRIPTION: Record<House, string> = {
  RegiusCardis: "規律正しく、物事を秩序立てて進める力を伸ばしたい人向けの学舎。",
  RoseSleep: "ミステリアスな個性を大切に、自分らしい魔力の伸ばし方を追求したい人向けの学舎。",
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

export default function Home() {
  const { house, isEnrolled, isLoading, error, enroll } = useAcademyStore();
  const [grade, setGrade] = useState<Grade>(LAUNCHED_GRADES[0]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  return (
    <ThemeProvider house={house ?? selectedHouse ?? "RegiusCardis"}>
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-house-bg p-8 text-house-text">
        <h1 className="font-display text-2xl">Advisaria Magica Academy</h1>

        <GrimoireCard title="学舎の選択">
          <div className="flex w-72 max-w-full flex-col gap-4">
            <p className="text-sm">学年段階と、入りたい学舎を選んでください。</p>

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

            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-1">学舎</legend>
              {HOUSES.map((candidate) => (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => setSelectedHouse(candidate)}
                  aria-pressed={selectedHouse === candidate}
                  className={`rounded-md border px-3 py-2 text-left transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
                    selectedHouse === candidate
                      ? "border-house-primary bg-house-primary text-house-on-primary"
                      : "border-house-primary/50 hover:opacity-80"
                  }`}
                >
                  <span className="font-display font-semibold">{HOUSE_LABEL[candidate]}</span>
                  <p className="mt-1 text-xs">{HOUSE_DESCRIPTION[candidate]}</p>
                </button>
              ))}
            </fieldset>

            <button
              type="button"
              disabled={isLoading || !selectedHouse}
              onClick={() => selectedHouse && enroll(selectedHouse, grade)}
              className="mt-2 rounded-md bg-house-primary px-4 py-2 text-sm font-semibold text-house-on-primary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
            >
              {isLoading ? "入学手続き中…" : "この学舎に入学する"}
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
