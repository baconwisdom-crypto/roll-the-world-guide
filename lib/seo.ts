import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import homepage from "@/config/homepage.json";
import { BRAND_ICON_METADATA } from "@/lib/brand-icons";
import {
  availableLocalesForPage,
  text,
} from "@/lib/content";
import {
  defaultLocale,
  localeLanguageTags,
  localeOpenGraphTags,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/urls";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { PageRecord } from "@/lib/types";
import type { SearchVisibility } from "@/lib/types";

export const SITE_TITLE = homepage.metadata.title;

export function pageCanonical(page: PageRecord, locale: Locale): string {
  return `${SITE_URL}${localizedHref(locale, page.route)}`;
}

export function robotsForSearchVisibility(searchVisibility: SearchVisibility): NonNullable<Metadata["robots"]> {
  return searchVisibility === "public"
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true };
}

export function buildPageMetadata(page: PageRecord, locale: Locale): Metadata {
  const canonical = pageCanonical(page, locale);
  const available = availableLocalesForPage(page);
  const languages: Record<string, string> = {};
  for (const target of available) {
    languages[localeLanguageTags[target]] = `${SITE_URL}${localizedHref(target, page.route)}`;
  }
  if (available.includes(defaultLocale)) {
    languages["x-default"] = `${SITE_URL}${localizedHref(defaultLocale, page.route)}`;
  }

  const image = page.images[0] ?? siteConfig.heroImage;
  const pageTitle = page.pageType === "Home" ? homepage.metadata.title : text(page.title, locale);
  const metadata: Metadata = {
    title: page.pageType === "Home" ? { absolute: pageTitle } : pageTitle,
    description: text(page.description, locale),
    ...(page.pageType === "Home" ? { keywords: homepage.metadata.keywords } : {}),
    alternates: { canonical, languages },
    robots: robotsForSearchVisibility(siteConfig.searchVisibility),
    twitter: {
      card: "summary_large_image", title: pageTitle, description: text(page.description, locale),
      ...(image ? { images: [{ url: new URL(image.src, SITE_URL).href, alt: text(image.alt, locale) }] } : {}),
    },
    openGraph: {
      title: pageTitle,
      description: text(page.description, locale),
      url: canonical,
      siteName: SITE_NAME,
      type: page.pageType === "Home" ? "website" : "article",
      locale: localeOpenGraphTags[locale],
      alternateLocale: available
        .filter((target) => target !== locale)
        .map((target) => localeOpenGraphTags[target]),
      ...(image
        ? {
            images: [
              {
                url: image.src.startsWith("http") ? image.src : `${SITE_URL}${image.src}`,
                alt: text(image.alt, locale),
              },
            ],
          }
        : {}),
    },
  };
  return metadata;
}

export function rootMetadata(locale: Locale): Metadata {
  const canonical = `${SITE_URL}${localizedHref(locale, "/")}`;
  const languages: Record<string, string> = {};
  for (const target of siteConfig.publishedLocales) {
    languages[localeLanguageTags[target]] = `${SITE_URL}${localizedHref(target, "/")}`;
  }
  languages["x-default"] = `${SITE_URL}${localizedHref(defaultLocale, "/")}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
    description: text(siteConfig.description, locale),
    icons: BRAND_ICON_METADATA,
    alternates: { canonical, languages },
    robots: robotsForSearchVisibility(siteConfig.searchVisibility),
    openGraph: { siteName: SITE_NAME, locale: localeOpenGraphTags[locale], url: canonical },
  };
}
