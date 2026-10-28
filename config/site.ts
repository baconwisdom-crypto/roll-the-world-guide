import type { SiteConfig } from "@/lib/types";
export const siteConfig: SiteConfig = {
 siteName: "Roll the World Wiki", shortName: "RW", siteSlug: "roll-the-world",
 description: { en: "An independent Roll the World Roblox guide to stars, upgrades, finds, codes and space." },
 siteUrl: "https://www.rolltheworldwiki.wiki", searchVisibility: "public",
 architecture: { enabled: true, templates: ["landing", "hub", "comparison", "procedure"] },
 theme: { accent: "#a9ee70", accentSoft: "#d5f8b8", background: "#0c1211", panel: "#151e1b" },
 brandIcon: { src: "/images/official-icon.png", alt: { en: "Official Roll the World game icon" }, sourceId: "official-game" },
 navigationIcons: { guides: "guides", stars: "updates", upgrades: "tools", finds: "database", space: "maps", codes: "codes", sources: "sources" },
 supportedLocales: ["en"], publishedLocales: ["en"], plannedLocales: [], lastVerified: "2026-10-26",
 officialLinks: [{ label: "Play on Roblox", url: "https://www.roblox.com/games/97342490021056/roll-the-world" }],
 heroImage: { src: "/images/official-hero.png", alt: { en: "Official Roll the World promotional artwork" }, heroMediaType: "official-promotional-image", sourceId: "official-game", ratio: "video" },
 heroVideo: null, mediaPresentation: { showImageText: false }, analytics: { enabled: true, measurementId: "G-1DREYT6CMM" },
 ads: { enabled: true, provider: "adsterra", previewPlaceholders: false, desktopChrome: { enabled: true }, placements: { "top-sticky": false, "left-sticky": true, "home-banner": true, "article-banner": true, "sidebar-square": true } },
 evidenceLabels: [{ label: "Official description", note: { en: "Developer information checked against the canonical Roblox experience." } }, { label: "Reviewed gameplay", note: { en: "Menu observations and screenshots from public community gameplay." } }],
 disclaimer: { en: "Independent fan guide. Not affiliated with Roblox or overzeer. Game content belongs to its respective owners." }
} satisfies SiteConfig;

