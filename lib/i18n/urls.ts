import { defaultLocale, hasLocalePrefix, locales, type Locale } from "./config";

/**
 * Locale-aware URL helpers, reserved for the app/[locale] migration
 * stage. Nothing in the app calls these yet.
 *
 * The site runs with trailingSlash: true, so every returned path ends
 * with "/". The default locale always keeps the existing unprefixed
 * paths, so current English URLs never change.
 */

/** Build the href for a locale version of an unprefixed path. */
export function localizedHref(locale: Locale, href: string): string {
  const path = href.startsWith("/") ? href : `/${href}`;
  if (!hasLocalePrefix(locale)) {
    return path;
  }
  const stripped = path.replace(/\/+$/, "");
  return `/${locale}${stripped}/`;
}

/** Convert an unprefixed route into the params shape used by an optional catch-all. */
export function routeToSegments(href: string): string[] {
  const normalized = href === "/" ? "/" : `${href.replace(/\/+$/, "")}/`;
  if (normalized === "/") return [];
  return normalized.slice(1, -1).split("/").filter(Boolean);
}

/** Keep every registered route canonicalized with a trailing slash. */
export function normalizeRoute(href: string): string {
  if (href === "/") return "/";
  return `/${href.replace(/^\/+|\/+$/g, "")}/`;
}

/**
 * Split a pathname into its locale and unprefixed path. Paths without a
 * locale prefix belong to the default locale. Reserved for the future
 * locale-aware routing entry (proxy + app/[locale]).
 */
export function parseLocalePathname(
  pathname: string,
  supportedLocales: readonly Locale[] = locales,
): { locale: Locale; path: string } {
  const normalizedPath = pathname || "/";
  for (const locale of supportedLocales) {
    if (!hasLocalePrefix(locale)) continue;
    if (normalizedPath === `/${locale}` || normalizedPath.startsWith(`/${locale}/`)) {
      const rest = normalizedPath.slice(locale.length + 1).replace(/^\/+/, "");
      return { locale, path: rest === "" ? "/" : `/${rest.replace(/\/+$/, "")}/` };
    }
  }
  return { locale: defaultLocale, path: normalizeRoute(normalizedPath) };
}
