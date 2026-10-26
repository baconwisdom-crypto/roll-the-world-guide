import { resolvePublicSources } from "@/lib/sources";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

/**
 * The single public citation block rendered at the bottom of a page.
 * Only first-party official sources are eligible, with a hard limit of three.
 */
export function SourceList({
  sourceIds,
  heading = "Sources",
  locale,
}: {
  sourceIds?: readonly string[];
  heading?: string;
  locale: Locale;
}) {
  const sources = resolvePublicSources(sourceIds);
  if (sources.length === 0) return null;

  return (
    <footer data-public-sources className="border-t border-line pt-5 text-xs leading-5 text-slate-500">
      <span className="font-semibold uppercase tracking-wider text-slate-600">
        {heading}
      </span>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {sources.map((source) => (
          <li key={source.id} className="inline-flex flex-wrap items-baseline gap-x-1">
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 underline decoration-slate-700 underline-offset-2 transition-colors hover:text-amber-300"
              >
                {source.name}, {source.publisher}
              </a>
            ) : (
              <span className="text-slate-500">
                {source.name} ({source.publisher}, no public link)
              </span>
            )}
            <span className="text-slate-600">
              · {formatDate(source.lastChecked)}
            </span>
          </li>
        ))}
      </ul>
    </footer>
  );
}
