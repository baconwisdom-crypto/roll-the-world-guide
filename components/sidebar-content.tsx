"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavigationIcon } from "./navigation-icon";
import type { SidebarGroup } from "@/lib/navigation";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";
import { cx } from "@/lib/utils";

function normalizePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

export function SidebarContent({
  groups,
  locale,
}: {
  groups: SidebarGroup[];
  locale: Locale;
}) {
  const pathname = usePathname() ?? "/";
  const isCurrent = (href: string) => {
    const target = normalizePath(localizedHref(locale, href));
    const current = normalizePath(pathname);
    return target === "/"
      ? current === "/" || current === `/${locale}`
      : current === target || current.startsWith(`${target}/`);
  };
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(groups.filter((group) => group.links.some((link) => isCurrent(link.href))).map((group) => group.key)),
  );

  const toggleGroup = (key: string, open: boolean) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  return (
    <>
      <div>
        <p className="font-display text-sm font-bold tracking-[0.16em] text-slate-200">
          WIKI NAVIGATION
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {groups.map((group) => (
          <details
            key={group.key}
            className="sidebar-group"
            open={openGroups.has(group.key)}
            onToggle={(event) => toggleGroup(group.key, event.currentTarget.open)}
          >
            <summary className="sidebar-group-summary cursor-pointer list-none marker:hidden">
              <span className="sidebar-group-summary__main">
                <NavigationIcon name={group.icon} />
                <span className="sidebar-group-summary__label">{group.label}</span>
              </span>
              <span aria-hidden="true" className="sidebar-chevron">
                ⌄
              </span>
            </summary>
            <ul className="sidebar-link-list mt-1 border-l border-line pl-3 text-sm">
              {group.links.map((link) => {
                const active = isCurrent(link.href);
                return (
                  <li key={link.pageId}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cx("sidebar-link", active && "sidebar-link--active")}
                      href={localizedHref(locale, link.href)}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </>
  );
}
