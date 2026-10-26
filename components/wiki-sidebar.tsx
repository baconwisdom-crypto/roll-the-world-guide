import { SidebarContent } from "./sidebar-content";
import { SidebarCodes } from "./roll-world-homepage";
import { sidebarGroups } from "@/lib/navigation";
import type { Locale } from "@/lib/i18n/config";

export function WikiSidebar({ locale }: { locale: Locale }) {
  const groups = sidebarGroups(locale);
  return (
    <aside
      className="sidebar-scroll lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:self-start"
      aria-label="Wiki navigation"
    >
      <details className="ui-surface rounded-xl border border-line bg-panel/50 p-4 lg:hidden">
        <summary className="sidebar-mobile-summary cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          Browse the guide
        </summary>
        <div className="pt-4">
          <SidebarContent groups={groups} locale={locale} />
          <SidebarCodes />
        </div>
      </details>
      <div className="ui-surface hidden rounded-xl border border-line bg-panel/40 p-4 lg:block">
        <SidebarContent groups={groups} locale={locale} />
        <SidebarCodes />
      </div>
    </aside>
  );
}
