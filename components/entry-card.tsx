import Link from "next/link";

/** Card linking to one of the main sections. */
export function EntryCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="ui-surface ui-interactive group block rounded-lg border border-line bg-panel/60 p-5 hover:border-amber-400/40 hover:bg-panel"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-bold tracking-wide text-slate-100 group-hover:text-amber-300">
          {title}
        </h3>
        <span
          aria-hidden="true"
          className="text-slate-600 transition-colors group-hover:text-amber-400"
        >
          →
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </Link>
  );
}
