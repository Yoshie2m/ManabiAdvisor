"use client";

import { useState } from "react";

type MagicalToggleProps = {
  label: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function MagicalToggle({
  label,
  defaultChecked = false,
  onChange,
}: MagicalToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  function handleClick() {
    const next = !checked;
    setChecked(next);
    onChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={handleClick}
      className={`relative h-6 w-11 rounded-full border border-house-primary/50 transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-house-focus ${
        checked ? "bg-house-primary" : "bg-house-bg"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform motion-reduce:transition-none ${
          checked ? "bg-house-on-primary" : "bg-house-text"
        } ${checked ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}
