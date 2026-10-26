import type { ReactNode } from "react";
import "@/app/globals.css";
import "@/app/architecture.css";
import { SITE_THEME_STYLE } from "@/lib/site";
import { GoogleAnalytics } from "@/components/google-analytics";
import { AdChrome, getAdChromeState } from "@/components/ad-chrome";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WikiSidebar } from "@/components/wiki-sidebar";
import { defaultLocale } from "@/lib/i18n/config";
import { rootMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = rootMetadata(defaultLocale);

export default function EnglishLayout({ children }: { children: ReactNode }) {
  const adChrome = getAdChromeState();
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: `${siteConfig.siteUrl}/`,
    inLanguage: "en",
  };
  return (
    <html lang="en" style={SITE_THEME_STYLE}>
      <body className={["flex min-h-screen flex-col", adChrome.top && "has-top-ad", adChrome.left && "has-left-ad"].filter(Boolean).join(" ")}>
        <GoogleAnalytics />
        <JsonLd data={webSiteJsonLd} />
        <AdChrome />
        <SiteHeader locale={defaultLocale} />
        <div className={siteConfig.architecture?.enabled ? "arch-site-container" : "mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[15rem_minmax(0,1fr)]"}>
          {!siteConfig.architecture?.enabled && <WikiSidebar locale={defaultLocale} />}
          <main className="page-content min-w-0">{children}</main>
        </div>
        <SiteFooter locale={defaultLocale} />
      </body>
    </html>
  );
}
