import { StatusBadge } from "./status-badge";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  summary?: string;
  status?: string;
  sourceIds?: string[];
}

/** Shared page intro: pre-release eyebrow, title, summary, and status. */
export function PageHeader({
  eyebrow,
  title,
  summary,
  status,
}: PageHeaderProps) {
  return (
    <div className="mb-10 border-b border-line pb-8">
      {eyebrow && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-400">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
        {title}
      </h1>
      {summary && (
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          {summary}
        </p>
      )}
      {status && (
        <div className="mt-5">
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
}
