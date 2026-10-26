import { siteConfig } from "@/config/site";
import type { AdPlacement } from "@/lib/types";

type AdSlotProps = {
  placement: AdPlacement;
  format: "top-sticky" | "vertical-rail" | "responsive-banner" | "sidebar-square";
  className?: string;
};

const formatLabel = {
  "top-sticky": "320 x 50",
  "vertical-rail": "160 x 600",
  "responsive-banner": "Responsive banner",
  "sidebar-square": "Square, up to 250 x 250",
} as const;

export function AdSlot({ placement, format, className }: AdSlotProps) {
  // A square or responsive banner must never create a wide left rail.
  if (placement === "left-sticky" && format !== "vertical-rail") return null;
  const ads = siteConfig.ads;
  const placementEnabled = ads.placements?.[placement] ?? false;
  // The neutral framework has no provider adapter or domain-specific codes.
  // A production project must add its verified responsive integration here.
  const visible = placementEnabled && !ads.enabled && ads.previewPlaceholders;

  if (!visible) return null;

  return (
    <aside
      className={["ad-slot", `ad-slot--${format}`, className].filter(Boolean).join(" ")}
      aria-label="Advertisement"
      data-ad-placement={placement}
      data-ad-state={ads.enabled ? "enabled" : "preview"}
      data-ad-provider={ads.provider}
    >
      <span className="ad-slot__label">Advertisement</span>
      <strong>{placement === "article-banner" ? "Native banner" : formatLabel[format]}</strong>
      <span>{ads.enabled ? "Ad container" : "Preview placement"}</span>
    </aside>
  );
}
