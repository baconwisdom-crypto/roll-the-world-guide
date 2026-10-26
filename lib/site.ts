import { siteConfig } from "@/config/site";
import { text } from "@/lib/content";

export { siteConfig };
export const SITE_NAME = siteConfig.siteName;
export const SITE_URL = siteConfig.siteUrl.replace(/\/+$/, "");
export const SEARCH_VISIBILITY = siteConfig.searchVisibility;
export const LAST_VERIFIED = siteConfig.lastVerified;

export function siteDescription(locale: Parameters<typeof text>[1]): string {
  return text(siteConfig.description, locale);
}

export const SITE_THEME_STYLE = { "--site-background": siteConfig.theme.background, "--site-panel": siteConfig.theme.panel, "--site-accent": siteConfig.theme.accent, "--site-accent-soft": siteConfig.theme.accentSoft } as import("react").CSSProperties;
