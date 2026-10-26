import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegisteredPage } from "@/components/registered-page";
import { siteConfig } from "@/config/site";
import { hasLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
import { isPublishedLocale, pageByRoute, publishedPages, routeToSegments } from "@/lib/content";
import { buildPageMetadata, rootMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return siteConfig.publishedLocales
    .filter((locale) => locale !== defaultLocale)
    .flatMap((locale) => publishedPages(locale).map((page) => ({ locale, path: routeToSegments(page.route) })));
}

function routeFromParams(path?: string[]): string {
  return path && path.length > 0 ? `/${path.join("/")}/` : "/";
}

async function resolveLocale(value: string): Promise<Locale> {
  if (!hasLocale(value) || !isPublishedLocale(value) || value === defaultLocale) notFound();
  return value;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; path?: string[] }> }): Promise<Metadata> {
  const { locale: value, path } = await params;
  const locale = await resolveLocale(value);
  const page = pageByRoute(routeFromParams(path), locale);
  return page ? buildPageMetadata(page, locale) : rootMetadata(locale);
}

export default async function LocalizedPage({ params }: { params: Promise<{ locale: string; path?: string[] }> }) {
  const { locale: value, path } = await params;
  const locale = await resolveLocale(value);
  const page = pageByRoute(routeFromParams(path), locale);
  if (!page) notFound();
  return <RegisteredPage page={page} locale={locale} />;
}
