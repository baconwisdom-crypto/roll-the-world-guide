import raw from "@/content/structure.json";
import { siteConfig } from "@/config/site";
import { pageById, pageIsAvailable } from "@/lib/content";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";
import type { SiteStructure, TaskDestination } from "./architecture-types";

export const structure = raw as SiteStructure;
export function structureFor(pageId: string) {
  const page = structure.pages[pageId];
  return siteConfig.architecture?.enabled && page && siteConfig.architecture.templates.includes(page.template) ? page : undefined;
}
export function destinationHref(destination: Pick<TaskDestination, "pageId" | "anchor">, locale: Locale) {
  const page = pageById(destination.pageId);
  if (!page || !pageIsAvailable(page, locale)) return undefined;
  return localizedHref(locale, page.route) + (destination.anchor ? `#${destination.anchor}` : "");
}
