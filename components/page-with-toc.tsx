import type { ReactNode } from "react";
import { Toc, type TocItem } from "./toc";

/**
 * Desktop two-column page frame with a sticky in-page table of contents.
 *
 * The sticky role sits on the grid item itself, mirroring WikiSidebar. A wrapper
 * inside the item cannot work: that wrapper is constrained by the item's own
 * height, so it has no travel and scrolls out of view together with the page.
 */
export function PageWithToc({
  items,
  children,
}: {
  items: readonly TocItem[];
  children: ReactNode;
}) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_14rem] xl:items-start">
      <div className="min-w-0 space-y-12">{children}</div>
      <aside
        className="sidebar-scroll hidden xl:sticky xl:top-28 xl:block xl:max-h-[calc(100vh-8rem)] xl:self-start xl:overflow-y-auto xl:overscroll-y-contain"
        aria-label="Page contents"
      >
        <Toc items={items} />
      </aside>
    </div>
  );
}
