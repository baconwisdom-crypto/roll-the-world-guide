import type { Locale } from "./config";

/**
 * Dictionary loading, following the App Router internationalization
 * pattern: each locale is loaded with a dynamic import so only the
 * requested dictionary is bundled for a given render.
 *
 * The dictionaries contain framework UI strings. Game content stays in the
 * content layer and declares its own locale availability.
 */
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  de: () => import("./dictionaries/de.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  ja: () => import("./dictionaries/ja.json").then((module) => module.default),
};

/** Shape of a dictionary, derived from the default locale. */
export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

/** Narrow an arbitrary string (e.g. a route param) to a supported locale. */
export const hasLocale = (locale: string): locale is Locale =>
  Object.prototype.hasOwnProperty.call(dictionaries, locale);

/**
 * Load the dictionary for a locale. Unknown locales fall back to the
 * default locale so framework consumers never crash before locale
 * routing exists; strict 404 handling for unknown locales arrives with
 * the app/[locale] migration stage.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
