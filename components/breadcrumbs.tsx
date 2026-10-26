import Link from "next/link";
import { breadcrumbsFor } from "@/lib/navigation";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "./json-ld";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";

/**
 * Visible breadcrumb trail plus BreadcrumbList structured data.
 *
 * The trail is built from real route segments only, so it never opens with a
 * synthetic "Home" crumb. When there is no hierarchy to show — the home page,
 * or a single top-level section page — nothing is rendered at all.
 */
export function Breadcrumbs({ route, locale }: { route: string; locale: Locale }) {
  const crumbs = breadcrumbsFor(route, locale);
  if (crumbs.length < 2) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.linkable ? { item: `${SITE_URL}${crumb.href}` } : {}),
    })),
  };

  return (
    <div className="mb-6">
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      {crumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-slate-700">
                  /
                </span>
              )}
              {index < crumbs.length - 1 && crumb.linkable ? (
                <Link
                  href={localizedHref(locale, crumb.href)}
                  className="transition-colors hover:text-slate-300"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-slate-300">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
