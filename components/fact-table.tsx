import type { ReactNode } from "react";

export interface FactRow {
  label: string;
  value: ReactNode;
}

/**
 * Key/value fact table used for specs, release facts, and account details.
 * Server-rendered; values may include inline elements such as badges.
 */
export function FactTable({ rows }: { rows: FactRow[] }) {
  return (
    <dl className="overflow-hidden rounded-lg border border-line">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={
            "grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4 " +
            (index % 2 === 0 ? "bg-panel/60" : "bg-transparent")
          }
        >
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:pt-0.5">
            {row.label}
          </dt>
          <dd className="text-sm leading-6 text-slate-300">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
