import type { MetadataRoute } from "next";
import { availableLocalesForPage, publishedPages } from "@/lib/content";
import { localeLanguageTags, type Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/urls";
import { LAST_VERIFIED, SITE_URL } from "@/lib/site";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (siteConfig.searchVisibility === "preview") return [];
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  for (const locale of ["en", "de", "fr", "es", "ja"] as Locale[]) {
    for (const page of publishedPages(locale)) {
      const href = localizedHref(locale, page.route);
      const url = `${SITE_URL}${href}`;
      if (seen.has(url)) continue;
      seen.add(url);
      const languages: Record<string, string> = {};
      for (const target of availableLocalesForPage(page)) {
        languages[localeLanguageTags[target]] = `${SITE_URL}${localizedHref(target, page.route)}`;
      }
      entries.push({ url, lastModified: LAST_VERIFIED, changeFrequency: "weekly", priority: page.pageType === "Home" ? 1 : 0.7, alternates: { languages } });
    }
  }
  return entries;
}
