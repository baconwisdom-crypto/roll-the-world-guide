import { statusTone, type StatusTone } from "@/lib/sources";
import { cx } from "@/lib/utils";

const toneClasses: Record<StatusTone, string> = {
  official: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  media: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  community: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
  wiki: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
  unconfirmed: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  mixed: "border-teal-400/30 bg-teal-400/10 text-teal-200",
  neutral: "border-slate-400/30 bg-slate-400/10 text-slate-300",
};

/**
 * Renders the verification status exactly as written in the data package.
 * The color is only a visual hint; the wording is never rewritten.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        toneClasses[statusTone(status)],
        className,
      )}
    >
      {status}
    </span>
  );
}
