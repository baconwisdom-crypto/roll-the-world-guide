/**
 * Locale configuration for the i18n framework layer.
 *
 * This module is the single source of truth for supported locales.
 * It is data-only: nothing in the existing app imports it yet, and no
 * game content is translated at this stage.
 *
 * URL strategy: the default locale ("en") keeps the site's existing
 * unprefixed paths ("/", "/characters/", ...). Non-default locales are
 * served under their locale prefix ("/de/...", "/fr/...", "/es/...").
 * Prefix routing is activated in the app/[locale] migration stage.
 */
export const locales = ["en", "de", "fr", "es", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/**
 * BCP 47 language tags for hreflang / <html lang> output.
 * Region-neutral tags match the locale codes one-to-one for now.
 */
export const localeLanguageTags: Record<Locale, string> = {
  en: "en",
  de: "de",
  fr: "fr",
  es: "es",
  ja: "ja",
};

/** Open Graph uses language_REGION values, while HTML and hreflang use BCP 47. */
export const localeOpenGraphTags: Record<Locale, string> = {
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  ja: "ja_JP",
};

/**
 * Native display names used by the locale switcher. They intentionally
 * stay identical across dictionaries so the switcher reads the same in
 * every language.
 */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  ja: "日本語",
};

export const localeUiLabels: Record<
  Locale,
  { label: string; ariaLabel: string; currentLabel: string }
> = {
  en: { label: "Language", ariaLabel: "Change language", currentLabel: "Current language" },
  de: { label: "Sprache", ariaLabel: "Sprache ändern", currentLabel: "Aktuelle Sprache" },
  fr: { label: "Langue", ariaLabel: "Changer de langue", currentLabel: "Langue actuelle" },
  es: { label: "Idioma", ariaLabel: "Cambiar idioma", currentLabel: "Idioma actual" },
  ja: { label: "言語", ariaLabel: "言語を変更", currentLabel: "現在の言語" },
};

/**
 * Whether a locale is served under a `/<locale>` URL prefix.
 * The default locale never gets a prefix, preserving every existing URL.
 */
export function hasLocalePrefix(locale: Locale): boolean {
  return locale !== defaultLocale;
}
