"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavItem } from "@/lib/navigation";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";
import { cx } from "@/lib/utils";

/**
 * The only client component in the chrome: it highlights the active section
 * and toggles the mobile menu. All page content stays server-rendered.
 */
export function NavLinks({ items, locale }: { items: readonly NavItem[]; locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    const target = localizedHref(locale, href).replace(/\/+$/, "") || "/";
    const current = pathname?.replace(/\/+$/, "") || "/";
    return target === "/"
      ? current === "/" || current === `/${locale}`
      : current === target || current.startsWith(`${target}/`);
  };

  const linkClass = (href: string) =>
    cx(
      "primary-nav-link rounded px-2 py-1 text-sm",
      isActive(href)
        ? "text-amber-300"
        : "text-slate-400",
    );

  return (
    <div className="flex items-center">
      <button
        type="button"
        className="primary-nav-toggle rounded border border-line px-2.5 py-1.5 text-xs uppercase tracking-widest text-slate-300 md:hidden"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      <nav
        id="primary-navigation"
        aria-label="Primary"
        className={cx(
          "absolute inset-x-0 top-full border-b border-line bg-night px-4 py-3 md:static md:border-0 md:bg-transparent md:p-0",
          open ? "block" : "hidden md:block",
        )}
      >
        <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={localizedHref(locale, item.href)}
                className={linkClass(item.href)}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
