"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  defaultLocale,
  localeLabels,
  localeLanguageTags,
  localeUiLabels,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { isPublishedLocale } from "@/lib/content";
import { localizedHref, parseLocalePathname } from "@/lib/i18n/urls";
import { routeAvailability } from "@/lib/route-map";
import { cx } from "@/lib/utils";

interface LocaleSwitcherProps {
  /** Locale of the page being rendered. Defaults to the default locale. */
  locale?: Locale;
  /**
   * Unprefixed path of the current page (e.g. "/characters/"), used to
   * build the equivalent link for each locale.
   */
  currentPath?: string;
  className?: string;
}

/**
 * Language switcher — base structure for the i18n framework layer.
 *
 * This component is intentionally NOT mounted anywhere yet. It gets wired
 * into the site header during the app/[locale] migration stage, once the
 * non-default locales (/de/, /fr/, /es/) have real routes to link to.
 * Until then every existing page renders exactly as before.
 */
export function LocaleSwitcher({
  locale = defaultLocale,
  currentPath = "/",
  className,
}: LocaleSwitcherProps) {
  const pathname = usePathname() || currentPath;
  const parsed = parseLocalePathname(pathname);
  const activeLocale = parsed.locale ?? locale;
  const pagePath = parsed.path || currentPath;
  const available = routeAvailability(pagePath);
  const targets = locales.filter(
    (target) => isPublishedLocale(target) && available.includes(target),
  );
  const ui = localeUiLabels[activeLocale];

  return (
    <nav aria-label={ui.ariaLabel} className={cx("min-w-0", className)}>
      <span className="sr-only">{ui.label}</span>
      <ul className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1">
        {targets.map((target) => {
          const active = target === activeLocale;
          return (
            <li key={target}>
              <Link
                href={localizedHref(target, pagePath)}
                hrefLang={localeLanguageTags[target]}
                lang={localeLanguageTags[target]}
                aria-current={active ? "page" : undefined}
                title={active ? ui.currentLabel : undefined}
                className={cx(
                  "rounded px-1.5 py-1 text-[10px] uppercase tracking-wider transition-colors sm:px-2 sm:text-[11px] sm:tracking-widest",
                  active
                    ? "text-amber-300"
                    : "text-slate-400 hover:text-slate-100",
                )}
              >
                {localeLabels[target]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
