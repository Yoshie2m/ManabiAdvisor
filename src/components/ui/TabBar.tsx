"use client";

import { useState } from "react";

import { TabIcon, type TabIconName } from "./TabIcon";

export type TabItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: TabIconName;
  badgeLabel?: (count: number) => string;
};

type TabBarProps = {
  tabs?: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** タブidごとのバッジ数（例: { tower: 12 }）。0や未指定なら出さない。 */
  badges?: Record<string, number>;
  className?: string;
  "aria-label"?: string;
};

const DEFAULT_TABS: TabItem[] = [
  { id: "hall", label: "大広間", sublabel: "ホーム", icon: "great-hall" },
  { id: "library", label: "魔導書庫", sublabel: "教科えらび", icon: "grimoire-library" },
  { id: "tower", label: "幻影の塔", sublabel: "ニガテ撃破", icon: "phantom-tower" },
];

export function TabBar({
  tabs = DEFAULT_TABS,
  value,
  defaultValue,
  onChange,
  badges,
  className,
  "aria-label": ariaLabel = "メインメニュー",
}: TabBarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? tabs[0]?.id);
  const current = isControlled ? value : internalValue;

  function select(id: string) {
    if (!isControlled) {
      setInternalValue(id);
    }
    onChange?.(id);
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={`grid auto-cols-fr grid-flow-col border-t border-house-primary/30 bg-house-bg pb-[env(safe-area-inset-bottom)] ${className ?? ""}`}
    >
      {tabs.map((tab) => {
        const isSelected = tab.id === current;
        const badgeCount = badges?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isSelected ? "page" : undefined}
            onClick={() => select(tab.id)}
            className={`tabbar-tab relative flex min-h-16 flex-col items-center gap-0.5 px-1 py-2 text-xs font-semibold transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-house-focus ${
              isSelected ? "text-house-accent" : "text-house-text/70 hover:text-house-text"
            }`}
          >
            <span className="tabbar-mark" aria-hidden="true" />
            <span className="relative">
              <TabIcon name={tab.icon} size={28} />
              {badgeCount ? (
                <span
                  aria-label={tab.badgeLabel ? tab.badgeLabel(badgeCount) : `残り ${badgeCount}`}
                  className="absolute -top-1.5 left-[18px] grid h-[18px] min-w-[18px] place-items-center rounded-md border border-house-accent bg-house-primary px-1 text-[11px] font-bold tabular-nums text-house-on-primary"
                >
                  {badgeCount}
                </span>
              ) : null}
            </span>
            <span>{tab.label}</span>
            {tab.sublabel && <span className="text-[11px] font-normal opacity-85">{tab.sublabel}</span>}
          </button>
        );
      })}
    </nav>
  );
}
