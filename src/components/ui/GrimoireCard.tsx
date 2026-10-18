import type { ReactNode } from "react";

type GrimoireCardProps = {
  title: string;
  children: ReactNode;
};

export function GrimoireCard({ title, children }: GrimoireCardProps) {
  return (
    <section className="rounded-lg border border-house-primary/40 bg-house-bg p-6 text-house-text shadow-sm">
      <h2 className="mb-2 font-display font-semibold text-house-primary">{title}</h2>
      {children}
    </section>
  );
}
