import type { ReactNode } from "react";

type GrimoireCardProps = {
  title: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function GrimoireCard({ title, footer, children }: GrimoireCardProps) {
  return (
    <section className="rounded-lg border border-house-primary/40 bg-house-bg p-6 text-house-text shadow-sm">
      <h2 className="mb-2 font-display font-semibold text-house-primary">{title}</h2>
      {children}
      {footer != null && (
        <footer className="mt-4 border-t border-house-primary/30 pt-3 font-display text-xs font-semibold tracking-wider text-house-accent uppercase">
          {footer}
        </footer>
      )}
    </section>
  );
}
