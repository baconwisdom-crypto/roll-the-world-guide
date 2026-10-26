import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegisteredPage } from "@/components/registered-page";
import { defaultLocale } from "@/lib/i18n/config";
import { pageByRoute, publishedPages, routeToSegments } from "@/lib/content";
import { buildPageMetadata, rootMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedPages(defaultLocale).map((page) => ({ path: routeToSegments(page.route) }));
}

function routeFromParams(path?: string[]): string {
  return path && path.length > 0 ? `/${path.join("/")}/` : "/";
}

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }): Promise<Metadata> {
  const { path } = await params;
  const page = pageByRoute(routeFromParams(path), defaultLocale);
  return page ? buildPageMetadata(page, defaultLocale) : rootMetadata(defaultLocale);
}

export default async function EnglishPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const page = pageByRoute(routeFromParams(path), defaultLocale);
  if (!page) notFound();
  return <RegisteredPage page={page} locale={defaultLocale} />;
}
