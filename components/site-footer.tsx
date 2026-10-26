import Link from "next/link";
import { mainNav } from "@/lib/navigation";
import { LAST_VERIFIED, SITE_NAME, siteConfig } from "@/lib/site";
import { plannedPages, text } from "@/lib/content";
import { localizedHref } from "@/lib/i18n/urls";
import { type Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils";

export function SiteFooter({ locale }: { locale: Locale }) {
  const nav = mainNav(locale);
  const planned = plannedPages(locale);
  return (
    <footer className="border-t border-line bg-panel/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-sm font-bold tracking-[0.2em] text-slate-200">
            {SITE_NAME}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {text(siteConfig.disclaimer, locale)}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Content last verified {formatDate(LAST_VERIFIED)}.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Sections
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={localizedHref(locale, item.href)}
                  className="text-slate-400 transition-colors hover:text-amber-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {planned.length > 0 && <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">Planned</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {planned.map((page) => <li key={page.page_id} className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-slate-500">{text(page.title, locale)}</li>)}
            </ul>
          </>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            How evidence is labeled
          </p>
          <ul className="mt-3 space-y-2">
            {siteConfig.evidenceLabels.map((entry) => (
              <li key={entry.label} className="text-xs leading-5 text-slate-500">
                <span className="font-medium text-slate-300">{entry.label}</span>
                {": "}
                {text(entry.note, locale)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
