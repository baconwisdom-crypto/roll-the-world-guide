import type { ReactNode } from "react";

export function SupportingGuidance({ title, entries, children, countLabel }: {
  title: string;
  expandLabel: string;
  countLabel: string;
  entries: { id: string; title: string }[];
  children: ReactNode;
}) {
  return <section id="supporting-guidance" className="arch-support" aria-labelledby="supporting-heading">
    <div className="arch-module-heading"><h2 id="supporting-heading">{title}</h2><span>{entries.length} {countLabel}</span></div>
    <nav aria-label={title}><ol className="arch-support-index">{entries.map((entry, index) => <li key={entry.id}>
      <a href={`#${entry.id}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{entry.title}</a>
    </li>)}</ol></nav>
    <div className="arch-section-stack">{children}</div>
  </section>;
}
