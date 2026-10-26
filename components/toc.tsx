export interface TocItem {
  id: string;
  title: string;
}

/** Server-rendered table of contents linking to in-page anchors. */
export function Toc({ items }: { items: readonly TocItem[] }) {
  return (
    <nav
      aria-label="On this page"
      className="ui-surface rounded-lg border border-line bg-panel/60 p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        On this page
      </p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-2">
            <span className="text-slate-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <a
              href={`#${item.id}`}
              className="text-slate-400 transition-colors hover:text-amber-300"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
