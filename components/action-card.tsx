import Link from "next/link";

/**
 * Lead card that turns one decision into one action. The title, short
 * description, and the single button label and target are all supplied by
 * the caller, so the component stays free of game copy, page ids, and routes.
 * The caller passes an already locale-aware href; Link keeps client-side
 * navigation for same-origin targets.
 */
export function ActionCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: { label: string; href: string };
}) {
  return (
    <aside className="ui-surface rounded-lg border border-amber-400/30 bg-amber-400/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
        {title}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      <Link
        href={action.href}
        className="ui-control ui-button ui-button--primary mt-5 w-full"
      >
        {action.label}
        <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
