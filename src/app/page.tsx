"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { BUDDY_PROFILE, BuddyPortrait } from "@/components/ui/BuddyPortrait";
import { GrimoireCard } from "@/components/ui/GrimoireCard";
import { MagicalToggle } from "@/components/ui/MagicalToggle";
import { BUDDIES } from "@/contexts/house-assignment/domain/models/Buddy";
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

function AuthForm() {
  const { isLoading, error, signUp, signIn } = useAcademyStore();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <GrimoireCard title={mode === "signIn" ? "ログイン" : "新規登録"}>
      <form
        className="flex w-72 max-w-full flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void (mode === "signIn" ? signIn(email, password) : signUp(email, password));
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span>メールアドレス</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-house-primary/50 bg-transparent px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>パスワード</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-house-primary/50 bg-transparent px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 rounded-md bg-house-primary px-4 py-2 text-sm font-semibold text-house-on-primary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50"
        >
          {isLoading ? "処理中…" : mode === "signIn" ? "ログイン" : "新規登録"}
        </button>

        {error && <p className="text-sm text-house-accent">{error}</p>}

        <button
          type="button"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          className="text-center text-xs text-house-primary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
        >
          {mode === "signIn" ? "新規登録はこちら" : "すでにアカウントをお持ちの方はこちら"}
        </button>
      </form>
    </GrimoireCard>
  );
}

export default function Home() {
  const {
    authUid,
    isAuthLoading,
    isStudentLoading,
    house,
    isEnrolled,
    overview,
    isLoading,
    error,
    enroll,
    changeGrade,
    buddy,
    chooseBuddy,
    signOutUser,
    hasLandingRedirectSettled,
    settleLandingRedirect,
  } = useAcademyStore();
  const router = useRouter();
  const [grade, setGrade] = useState<Grade>(LAUNCHED_GRADES[0]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const isRedirectingToAcademy = !!authUid && isEnrolled && !hasLandingRedirectSettled;

  useEffect(() => {
    if (!authUid || isStudentLoading || hasLandingRedirectSettled) {
      return;
    }
    // 入学済みなら修練場側のマウント時にsettleする（ここでsettleすると遷移完了前にカードが一瞬見える）
    if (isEnrolled) {
      router.replace("/academy");
    } else {
      settleLandingRedirect();
    }
  }, [authUid, isStudentLoading, isEnrolled, hasLandingRedirectSettled, settleLandingRedirect, router]);

  if (isAuthLoading || isStudentLoading || isRedirectingToAcademy) {
    return (
      <ThemeProvider house="RegiusCardis">
        <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-house-bg p-8 text-house-text">
          <p className="text-sm">読み込み中…</p>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider house={house ?? selectedHouse ?? "RegiusCardis"}>
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 bg-house-bg p-8 text-house-text">
        <h1 className="font-display text-2xl">Advisaria Magica Academy</h1>

        {!authUid ? (
          <AuthForm />
        ) : isEnrolled && house ? (
          <GrimoireCard title="おかえりなさい">
            <div className="flex w-72 max-w-full flex-col gap-4">
              <div className="flex items-center justify-between text-xs opacity-70">
                <span>ログイン中</span>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
                >
                  ログアウト
                </button>
              </div>

              <p className="text-sm">
                配属学舎: <span className="font-display text-house-primary">{HOUSE_LABEL[house]}</span>
              </p>

              <fieldset className="flex flex-col gap-1 text-sm">
                <legend className="mb-1">学年段階</legend>
                <div className="flex gap-2">
                  {LAUNCHED_GRADES.map((candidate) => (
                    <button
                      key={candidate}
                      type="button"
                      disabled={isLoading || !overview}
                      onClick={() => candidate !== overview?.grade && void changeGrade(candidate)}
                      aria-pressed={overview?.grade === candidate}
                      className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50 ${
                        overview?.grade === candidate
                          ? "border-house-primary bg-house-primary text-house-on-primary"
                          : "border-house-primary/50 text-house-primary hover:opacity-80"
                      }`}
                    >
                      {GRADE_LABEL[candidate]}
                    </button>
                  ))}
                </div>
                {error && <p className="text-xs text-house-accent">{error}</p>}
              </fieldset>

              <fieldset className="flex flex-col gap-1 text-sm">
                <legend className="mb-1">バディ（一緒に頑張る仲間）</legend>
                <div className="flex gap-2">
                  {BUDDIES.map((candidate) => (
                    <button
                      key={candidate}
                      type="button"
                      disabled={isLoading}
                      onClick={() => candidate !== buddy && void chooseBuddy(candidate)}
                      aria-pressed={buddy === candidate}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:opacity-50 ${
                        buddy === candidate
                          ? "border-house-primary bg-house-primary/20"
                          : "border-house-primary/50 bg-house-text/5 hover:opacity-80"
                      }`}
                    >
                      <BuddyPortrait buddy={candidate} scale={2} />
                      <span className="font-semibold">
                        {BUDDY_PROFILE[candidate].name}（{BUDDY_PROFILE[candidate].reading}）
                      </span>
                      <span className="opacity-80">{BUDDY_PROFILE[candidate].description}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <Link
                href="/academy"
                className="text-center text-sm font-semibold text-house-primary underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
              >
                修練場へ進む →
              </Link>
            </div>
          </GrimoireCard>
        ) : (
          <GrimoireCard title="学舎の選択">
            <div className="flex w-72 max-w-full flex-col gap-4">
              <div className="flex items-center justify-between text-xs opacity-70">
                <span>ログイン中</span>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus"
                >
                  ログアウト
                </button>
              </div>

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
            </div>
          </GrimoireCard>
        )}

        <MagicalToggle label="通知を受け取る" />
      </div>
    </ThemeProvider>
  );
}
