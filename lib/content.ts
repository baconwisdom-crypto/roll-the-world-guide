import { pages } from "@/content/pages";
import { siteConfig } from "@/config/site";
import {
  defaultLocale,
  hasLocale,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref, normalizeRoute, routeToSegments } from "@/lib/i18n/urls";
import type { PageRecord } from "@/lib/types";

export { normalizeRoute, routeToSegments };

export function text(value: { en: string } & Partial<Record<Exclude<Locale, "en">, string>>, locale: Locale): string {
  return value[locale] ?? value.en;
}

export function isPublishedLocale(locale: Locale): boolean {
  return siteConfig.publishedLocales.includes(locale);
}

export function pageIsAvailable(page: PageRecord, locale: Locale): boolean {
  return (
    page.publicationStatus === "published" &&
    isPublishedLocale(locale) &&
    page.localeAvailability.includes(locale) &&
    Boolean(page.title[locale] ?? page.title.en)
  );
}

export function publishedPages(locale: Locale = defaultLocale): PageRecord[] {
  return pages.filter((page) => pageIsAvailable(page, locale));
}

export function plannedPages(locale: Locale = defaultLocale): PageRecord[] {
  return pages.filter(
    (page) =>
      page.publicationStatus === "planned" &&
      page.localeAvailability.includes(locale),
  );
}

export function pageById(pageId: string): PageRecord | undefined {
  return pages.find((page) => page.page_id === pageId);
}

export function pageByRoute(
  route: string,
  locale: Locale = defaultLocale,
): PageRecord | undefined {
  const normalized = normalizeRoute(route);
  return publishedPages(locale).find((page) => normalizeRoute(page.route) === normalized);
}

export function availableLocalesForPage(page: PageRecord): Locale[] {
  return siteConfig.publishedLocales.filter(
    (locale) => page.localeAvailability.includes(locale) && pageIsAvailable(page, locale),
  );
}

export function hrefForPage(page: PageRecord, locale: Locale): string {
  return localizedHref(locale, page.route);
}

export function pagePathParams(locale: Locale): Array<{ locale: Locale; path: string[] }> {
  return publishedPages(locale)
    .filter((page) => page.route !== "/")
    .map((page) => ({ locale, path: routeToSegments(page.route) }));
}

export function allLocalePageParams(): Array<{ locale: Locale; path: string[] }> {
  return siteConfig.publishedLocales.flatMap((locale) => pagePathParams(locale));
}

export function hasKnownLocale(value: string): value is Locale {
  return hasLocale(value);
}
