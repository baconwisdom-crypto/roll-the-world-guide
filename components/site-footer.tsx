import Link from "next/link";
import homepage from "@/config/homepage.json";
import { mainNav } from "@/lib/navigation";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";

export function SiteFooter({ locale }: { locale: Locale }) {
  const footer = homepage.footer;
  const links = [footer.playGame, footer.officialDiscord, footer.officialYoutube, footer.communityTool, footer.privacyPolicy, footer.termsOfService].filter((link): link is { label: string; href: string } => link !== null);
  return <footer className="border-t border-line bg-panel/40" data-homepage-footer>
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
      <div><h2 className="font-display text-base font-bold text-slate-200">{footer.aboutTitle}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{footer.about}</p></div>
      <nav aria-label="Footer guides"><h2 className="text-sm font-bold text-slate-200">Explore the guide</h2><p className="mt-3 text-sm text-slate-400">{footer.description}</p><ul className="mt-3 space-y-2 text-sm">{mainNav(locale).map(item => <li key={item.href}><Link className="rw-footer-link" href={localizedHref(locale, item.href)}>{item.label}</Link></li>)}</ul></nav>
      <nav aria-label="Game and site information"><h2 className="text-sm font-bold text-slate-200">Game and site information</h2><ul className="mt-3 space-y-3 text-sm">{links.map(link => <li key={link.href}><Link className="rw-footer-link" href={link.href} {...(link.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label}</Link></li>)}</ul></nav>
    </div>
  </footer>;
}
