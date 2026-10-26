import Link from "next/link";
import { NavLinks } from "./nav-links";
import { LocaleSwitcher } from "./locale-switcher";
import { SiteBrandMark } from "./site-brand-mark";
import { mainNav } from "@/lib/navigation";
import { LAST_VERIFIED, SITE_NAME, siteConfig } from "@/lib/site";
import { localizedHref } from "@/lib/i18n/urls";
import { localeUiLabels, type Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils";

export function SiteHeader({ locale }: { locale: Locale }) {
  const nav = mainNav(locale);
  const ui = localeUiLabels[locale];
  return (
    <header className="relative z-40 border-b border-line bg-night/90 backdrop-blur">
      <div className="border-b border-line/60 bg-panel/60">
        <p className="mx-auto max-w-6xl break-words px-4 py-1.5 text-[11px] uppercase tracking-widest text-amber-300/90 sm:px-6">
          {SITE_NAME} · content last verified{" "}
          {formatDate(LAST_VERIFIED)}
        </p>
      </div>
      <div className="site-header-shell relative mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="site-header-brand-row">
          <Link
            href={localizedHref(locale, "/")}
            aria-label={SITE_NAME}
            className="site-brand group min-w-0"
          >
            <SiteBrandMark shortName={siteConfig.shortName} />
            <span className="site-brand__name font-display text-lg font-bold tracking-[0.12em] text-slate-100">
              {SITE_NAME}
            </span>
            <span className="site-brand__locale hidden text-[10px] uppercase tracking-[0.3em] text-slate-500 sm:inline">
              {ui.label}
            </span>
          </Link>
          <LocaleSwitcher locale={locale} className="site-header-locale" />
        </div>
        <div className="site-header-navigation-row">
          <NavLinks items={nav} locale={locale} />
        </div>
      </div>
    </header>
  );
}
