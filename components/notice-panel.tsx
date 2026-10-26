import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

const variants = {
  boundary: "border-amber-400/30 bg-amber-400/5",
  info: "border-sky-400/30 bg-sky-400/5",
  policy: "border-line bg-panel/60",
} as const;

const titleColors = {
  boundary: "text-amber-300",
  info: "text-sky-300",
  policy: "text-slate-300",
} as const;

/** Callout panel for data boundaries, open questions, and editorial notes. */
export function NoticePanel({
  title,
  variant = "policy",
  children,
}: {
  title: string;
  variant?: keyof typeof variants;
  children: ReactNode;
}) {
  return (
    <aside className={cx("rounded-lg border p-5", variants[variant])}>
      <p
        className={cx(
          "text-xs font-semibold uppercase tracking-widest",
          titleColors[variant],
        )}
      >
        {title}
      </p>
      <div className="mt-3 text-sm leading-6 text-slate-400">{children}</div>
    </aside>
  );
}
