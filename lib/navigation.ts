import { pageByRoute, pageIsAvailable, publishedPages, text } from "@/lib/content";
import { siteConfig } from "@/config/site";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import type { NavigationIconName } from "@/lib/types";

export const FALLBACK_NAVIGATION_ICON: NavigationIconName = "overview";

/** Resolve a configuration key while keeping a stable visual fallback. */
export function navigationIconFor(
  pageId: string,
  section?: string,
): NavigationIconName {
  const configured = siteConfig.navigationIcons ?? {};
  const sectionKey = section?.trim().toLowerCase();
  return (
    configured[pageId] ??
    (section ? configured[section] : undefined) ??
    (sectionKey ? configured[sectionKey] : undefined) ??
    FALLBACK_NAVIGATION_ICON
  );
}

export interface NavItem {
  pageId: string;
  label: string;
  href: string;
  section: string;
  icon: NavigationIconName;
}

/** Navigation is derived from published page records with navigation metadata. */
export function mainNav(locale: Locale = defaultLocale): NavItem[] {
  return publishedPages(locale)
    .filter((page) => page.navigation && page.route !== "/")
    .sort((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0))
    .map((page) => ({
      pageId: page.page_id,
      label: text(page.navigation!.label, locale),
      href: page.route,
      section: page.section,
      icon: navigationIconFor(page.page_id, page.section),
    }));
}

export interface SidebarLink {
  pageId: string;
  label: string;
  href: string;
}

export interface SidebarGroup {
  key: string;
  section: string;
  label: string;
  icon: NavigationIconName;
  links: SidebarLink[];
}

/** Build the same data model for the desktop and mobile wiki directories. */
export function sidebarGroups(locale: Locale = defaultLocale): SidebarGroup[] {
  const groups = mainNav(locale).map((item) => ({
    key: item.pageId,
    section: item.section,
    label: item.label,
    icon: item.icon,
    links: [{ pageId: item.pageId, label: "Overview", href: item.href }],
  }));

  const extraPages = publishedPages(locale).filter(
    (page) => !page.navigation && page.route !== "/",
  );
  for (const page of extraPages) {
    const group = groups.find((candidate) => candidate.section === page.section);
    const link = {
      pageId: page.page_id,
      label: text(page.title, locale),
      href: page.route,
    };
    if (group) group.links.push(link);
    else {
      groups.push({
        key: page.page_id,
        section: page.section,
        label: page.section,
        icon: navigationIconFor(page.page_id, page.section),
        links: [link],
      });
    }
  }
  return groups;
}

export interface Breadcrumb {
  label: string;
  href: string;
  linkable: boolean;
}

function humanize(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Breadcrumbs are derived from the route's own segments only. There is
 * deliberately no synthetic root crumb: the header brand link already covers
 * "back to the start", and a one-item trail carries no navigation meaning, so
 * callers treat anything shorter than two items as nothing to render.
 */
export function breadcrumbsFor(route: string, locale: Locale = defaultLocale): Breadcrumb[] {
  const normalized = route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}/`;
  if (normalized === "/") return [];

  const crumbs: Breadcrumb[] = [];
  const segments = normalized.split("/").filter(Boolean);
  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const href = `${path}/`;
    const page = pageByRoute(href, locale);
    crumbs.push({
      label: page ? text(page.title, locale) : humanize(segment),
      href,
      linkable: Boolean(page && pageIsAvailable(page, locale)),
    });
  }
  return crumbs;
}
