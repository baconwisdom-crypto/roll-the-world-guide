/** Anchored section heading so table-of-contents links have stable targets. */
export function SectionHeading({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <h2
      id={id}
      className="group flex scroll-mt-24 items-baseline gap-2 font-display text-xl font-bold tracking-tight text-slate-100 sm:text-2xl"
    >
      <span className="text-amber-500/70">§</span>
      {title}
      <a
        href={`#${id}`}
        aria-label={`Link to section: ${title}`}
        className="text-sm text-slate-600 opacity-0 transition-opacity group-hover:opacity-100"
      >
        #
      </a>
    </h2>
  );
}
