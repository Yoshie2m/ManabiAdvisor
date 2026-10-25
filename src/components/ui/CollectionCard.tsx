"use client";

import { useState, type ReactNode } from "react";

import { TabIcon, type TabIconName } from "./TabIcon";

// デザインシステムの CollectionCard（キャラクター図鑑の1ページ）。ステータス・スキル欄は使わない（第20回ヒアリング）。
type Backdrop = "classroom" | "house" | "plain";

const BACKDROPS: { id: Backdrop; label: string }[] = [
  { id: "classroom", label: "教室" },
  { id: "house", label: "寮の色" },
  { id: "plain", label: "無地" },
];

type CollectionCardProps = {
  number: number;
  acquired: boolean;
  rarity: number;
  attribute?: TabIconName;
  attributeLabel?: string;
  name: string;
  furigana?: string;
  title?: string;
  flavor?: string;
  image?: string;
  acquire: ReactNode;
  onBack?: () => void;
  onVoice?: () => void;
  defaultBackdrop?: Backdrop;
};

const BUTTON_CLASS =
  "inline-flex items-center justify-center gap-1 rounded-md border border-house-primary/60 px-2 py-1 text-[13px] hover:border-house-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus disabled:cursor-not-allowed disabled:opacity-45";

function DexSection({ icon, title, children }: { icon: TabIconName; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1 border-t border-house-primary/30 px-3 py-2 first:border-t-0">
      <h4 className="flex items-center gap-1 text-xs font-bold text-[var(--dex-meta)]">
        <TabIcon name={icon} size={16} />
        {title}
      </h4>
      {children}
    </section>
  );
}

export function CollectionCard({
  number,
  acquired,
  rarity,
  attribute,
  attributeLabel,
  name,
  furigana,
  title,
  flavor,
  image,
  acquire,
  onBack,
  onVoice,
  defaultBackdrop = "classroom",
}: CollectionCardProps) {
  const [backdrop, setBackdrop] = useState<Backdrop>(defaultBackdrop);
  const [isZoomed, setIsZoomed] = useState(false);
  const no = String(number).padStart(3, "0");
  const stars = Math.max(0, Math.min(5, rarity));
  const backdropIndex = BACKDROPS.findIndex((b) => b.id === backdrop);

  return (
    <section
      aria-label={`図鑑 No.${no}`}
      className={"@container relative flex flex-col gap-3 rounded-lg border border-house-primary/40 bg-house-bg p-4 text-sm leading-[22px] text-house-text"}
    >
      <div className="flex items-center justify-between gap-2 border-b border-house-primary/30 pb-2">
        <button type="button" onClick={onBack} disabled={!onBack} className={`${BUTTON_CLASS} min-h-9`}>
          <TabIcon name="ui-back" size={18} />
          戻る
        </button>
        <div className="flex items-center gap-2">
          <span className="font-display text-[13px] font-semibold tracking-[0.12em]">図鑑 No.{no}</span>
          <span
            className={`rounded-md border px-2 text-xs leading-[18px] font-semibold ${
              acquired ? "border-[var(--dex-meta)] bg-[var(--dex-meta)] text-house-bg" : "border-house-primary/60"
            }`}
          >
            {acquired ? "獲得済" : "未獲得"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 @[600px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <div
            className={`dex-stage--${backdrop} relative grid min-h-[280px] flex-1 place-items-center overflow-hidden rounded-md border border-house-primary/30 @[600px]:min-h-[360px]`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={acquired ? name : "未獲得のキャラクターの影"}
                className={`block h-[240px] w-auto max-w-full object-contain [image-rendering:pixelated] @[600px]:h-[320px] ${
                  acquired ? "" : "dex-art--silhouette"
                }`}
              />
            ) : (
              <span className="text-[13px] opacity-80">イラスト準備中</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              disabled={!image || !acquired}
              className={`${BUTTON_CLASS} min-h-10 min-w-0 flex-1`}
            >
              <TabIcon name="ui-zoom" size={18} />
              拡大
            </button>
            <button
              type="button"
              onClick={() => setBackdrop(BACKDROPS[(backdropIndex + 1) % BACKDROPS.length].id)}
              aria-label={`背景切替（いま：${BACKDROPS[backdropIndex].label}）`}
              className={`${BUTTON_CLASS} min-h-10 min-w-0 flex-1`}
            >
              <TabIcon name="ui-backdrop" size={18} />
              背景切替
            </button>
            <button
              type="button"
              onClick={onVoice}
              disabled={!onVoice || !acquired}
              className={`${BUTTON_CLASS} min-h-10 min-w-0 flex-1`}
            >
              <TabIcon name="ui-voice" size={18} />
              ボイス
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-md border border-house-primary/30">
          <div className="flex flex-col px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span role="img" aria-label={`レア度 ${stars}／5`} className="text-lg leading-[22px] tracking-[2px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={i < stars ? "text-[var(--dex-meta)]" : "text-house-text/45"}>
                    {i < stars ? "★" : "☆"}
                  </span>
                ))}
              </span>
              {attribute && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--dex-meta)]">
                  <TabIcon name={attribute} size={20} />
                  {attributeLabel}
                </span>
              )}
            </div>
            <h3 className="mt-1 text-xl leading-7 font-bold">
              <span className="text-sm text-[var(--dex-meta)]">◆ </span>
              {acquired ? name : "？？？"}
            </h3>
            <p className={`text-xs leading-[18px] opacity-85 ${acquired ? "" : "italic"}`}>
              {acquired ? [furigana, title].filter(Boolean).join(" / ") : "獲得すると名前が明かされる"}
            </p>
          </div>
          <DexSection icon="ui-scroll" title="フレーバーテキスト">
            <p className={`leading-6 ${acquired ? "" : "italic"}`}>{acquired ? flavor : "まだ記されていない頁。"}</p>
          </DexSection>
          <DexSection icon="ui-gift" title="獲得条件 / ドロップ先">
            <div className="text-[13px] leading-5">{acquire}</div>
          </DexSection>
        </div>
      </div>

      {isZoomed && image && (
        <div
          role="dialog"
          aria-label={`${name} 拡大`}
          onClick={() => setIsZoomed(false)}
          className="absolute inset-0 z-10 flex cursor-zoom-out flex-col items-center justify-center gap-2 rounded-lg bg-house-bg/95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={name} className="h-[min(80%,560px)] w-auto [image-rendering:pixelated]" />
          <button type="button" autoFocus onClick={() => setIsZoomed(false)} className={BUTTON_CLASS}>
            閉じる
          </button>
        </div>
      )}
    </section>
  );
}
