import type { Metadata } from "next";

/** Fixed framework outputs produced from SiteConfig.brandIcon.src. */
export const BRAND_ICON_OUTPUTS = {
  favicon: "/favicon.ico",
  icon192: "/icon-192.png",
  appleTouch: "/apple-touch-icon.png",
} as const;

/** Shared root metadata for every derived game site. */
export const BRAND_ICON_METADATA = {
  icon: [
    { url: BRAND_ICON_OUTPUTS.favicon, sizes: "any", type: "image/x-icon" },
    { url: BRAND_ICON_OUTPUTS.icon192, sizes: "192x192", type: "image/png" },
  ],
  shortcut: BRAND_ICON_OUTPUTS.favicon,
  apple: [
    {
      url: BRAND_ICON_OUTPUTS.appleTouch,
      sizes: "180x180",
      type: "image/png",
    },
  ],
} satisfies NonNullable<Metadata["icons"]>;
