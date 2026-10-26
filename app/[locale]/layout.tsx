import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "@/app/architecture.css";
import { SITE_THEME_STYLE } from "@/lib/site";
import { notFound } from "next/navigation";
import { GoogleAnalytics } from "@/components/google-analytics";
import { AdChrome, getAdChromeState } from "@/components/ad-chrome";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WikiSidebar } from "@/components/wiki-sidebar";
import { siteConfig } from "@/config/site";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n/config";
import { isPublishedLocale, publishedPages } from "@/lib/content";
import { rootMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return siteConfig.publishedLocales
    .filter((locale) => locale !== defaultLocale && publishedPages(locale).length > 0)
    .map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!hasLocale(value) || !isPublishedLocale(value) || value === defaultLocale) notFound();
  return rootMetadata(value);
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!hasLocale(value) || !isPublishedLocale(value) || value === defaultLocale) notFound();
  const locale = value as Locale;
  const adChrome = getAdChromeState();
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: `${siteConfig.siteUrl}/${locale}/`,
    inLanguage: locale,
  };
  return (
    <html lang={locale} style={SITE_THEME_STYLE}>
      <body className={["flex min-h-screen flex-col", adChrome.top && "has-top-ad", adChrome.left && "has-left-ad"].filter(Boolean).join(" ")}>
        <GoogleAnalytics />
        <JsonLd data={webSiteJsonLd} />
        <AdChrome />
        <SiteHeader locale={locale} />
        <div className={siteConfig.architecture?.enabled ? "arch-site-container" : "mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[15rem_minmax(0,1fr)]"}>
          {!siteConfig.architecture?.enabled && <WikiSidebar locale={locale} />}
          <main className="page-content min-w-0">{children}</main>
        </div>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
