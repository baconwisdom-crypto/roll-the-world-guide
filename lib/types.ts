import type { Locale } from "@/lib/i18n/config";

export type LocalizedText = {
  en: string;
} & Partial<Record<Exclude<Locale, "en">, string>>;

export const navigationIconNames = [
  "overview",
  "guides",
  "tier-lists",
  "codes",
  "updates",
  "tools",
  "database",
  "characters",
  "maps",
  "sources",
] as const;

export type NavigationIconName = (typeof navigationIconNames)[number];

export interface BrandIcon {
  /** A confirmed first-party square source kept in the site's public folder. */
  src: string;
  alt: LocalizedText;
  sourceId: string;
}

export type PageType =
  | "Home"
  | "Hub"
  | "GuideArticle"
  | "Database"
  | "Character"
  | "Route"
  | "Source"
  | "Spoiler";

export type PublicationStatus =
  | "published"
  | "planned"
  | "draft"
  | "internal-hold";

export type SearchVisibility = "public" | "preview";

export type HomeHeroVariant = "compact-square" | "wide-video";

export interface PageImage {
  id?: string;
  src: string;
  label?: LocalizedText;
  alt: LocalizedText;
  caption?: LocalizedText;
  ratio?: "video" | "square" | "portrait";
  fit?: "cover" | "contain";
  sourceId?: string;
  sourceUrl?: string;
  sourceArticleUrl?: string;
  videoId?: string;
  timecode?: string;
  media?: string;
}

export type HeroImageMediaType =
  | "official-key-art"
  | "official-promotional-image";

export interface HeroImage extends PageImage {
  heroMediaType: HeroImageMediaType;
  sourceId: string;
}

export interface EvidenceRow {
  id: string;
  statement: LocalizedText;
  sourceId: string;
  sourceMedia?: string;
  sourceUrl?: string;
  sourceContent?: string;
  pageSection?: string;
  unverifiedHandling?: string;
  evidenceType: LocalizedText;
  verificationStatus: LocalizedText;
  spoilerLevel: LocalizedText;
  notes?: LocalizedText;
  section?: LocalizedText;
  featured?: boolean;
}

export interface PageTable {
  columns: LocalizedText[];
  rows: LocalizedText[][];
}

export interface PageCard {
  title: LocalizedText;
  summary: LocalizedText;
  pageId?: string;
  href?: string;
  status?: LocalizedText;
}

export interface PageSection {
  id: string;
  title: LocalizedText;
  summary?: LocalizedText;
  paragraphs?: LocalizedText[];
  bullets?: LocalizedText[];
  cards?: PageCard[];
  table?: PageTable;
  imageIds?: string[];
  sourceIds?: string[];
  spoilerLevel?: LocalizedText;
  sourceNote?: LocalizedText;
  steps?: Array<{ title: LocalizedText; prerequisite: LocalizedText; action: LocalizedText; success: LocalizedText; fallback: LocalizedText }>;
  catalog?: ReferenceCatalogData;
}

export interface ReferenceCatalogData {
  searchLabel: LocalizedText;
  placeholder: LocalizedText;
  resultLabel: LocalizedText;
  clearLabel: LocalizedText;
  emptyLabel: LocalizedText;
  fields: LocalizedText[];
  rows: Array<{ name: LocalizedText; location: LocalizedText; values: LocalizedText[] }>;
}

export interface PageFaq {
  question: LocalizedText;
  answer: LocalizedText;
}

/**
 * The single deliberate action a page offers next. A record resolves the
 * target from either a registered `pageId` (preferred, locale-aware) or an
 * explicit in-site `href`, so the rendering components never carry a game
 * route, a page id, or button copy.
 */
export interface PageAction {
  label: LocalizedText;
  pageId?: string;
  href?: string;
}

/** Compact, localized facts shown directly below a homepage hero. */
export interface PageRecord {
  page_id: string;
  route: string;
  section: string;
  title: LocalizedText;
  description: LocalizedText;
  pageType: PageType;
  pageStatus: LocalizedText;
  intro: LocalizedText;
  quickAnswer: {
    title: LocalizedText;
    body: LocalizedText;
    status: LocalizedText;
  };
  primaryAction?: PageAction;
  answerSourceNote?: LocalizedText;
  sections: PageSection[];
  faq?: PageFaq[];
  boundary: {
    title: LocalizedText;
    items: LocalizedText[];
  };
  sourceIds: string[];
  evidence: EvidenceRow[];
  spoilerLevel: LocalizedText;
  images: PageImage[];
  relatedPageIds: string[];
  localeAvailability: Locale[];
  publicationStatus: PublicationStatus;
  navigation?: {
    label: LocalizedText;
    order: number;
  };
}

export interface SourceRecord {
  id: string;
  name: string;
  publisher: string;
  type: string;
  url: string | null;
  lastChecked: string;
  status: string;
  publicUse: "official-first-party" | "internal-only";
  note: LocalizedText;
}

export interface HeroVideo {
  provider: "YouTube";
  heroMediaType: "official-promotional-video";
  videoId: string;
  title: LocalizedText;
  url: string;
  sourceId: string;
}

export interface SiteTheme {
  accent: string;
  accentSoft: string;
  background: string;
  panel: string;
}

export type AdPlacement = "top-sticky" | "left-sticky" | "home-banner" | "article-banner" | "sidebar-square";

export interface SiteConfig {
  siteName: string;
  shortName: string;
  siteSlug: string;
  description: LocalizedText;
  siteUrl: string;
  searchVisibility: SearchVisibility;
  architecture?: { enabled: boolean; templates: import("./architecture-types").PageTemplate[] };
  theme: SiteTheme;
  brandIcon: BrandIcon;
  navigationIcons: Partial<Record<string, NavigationIconName>>;
  supportedLocales: Locale[];
  publishedLocales: Locale[];
  plannedLocales: Locale[];
  lastVerified: string;
  officialLinks: Array<{ label: string; url: string }>;
  heroImage: HeroImage | null;
  heroVideo: HeroVideo | null;
  mediaPresentation: {
    showImageText: boolean;
    homeHeroVariant?: HomeHeroVariant;
  };
  analytics: {
    enabled: boolean;
    measurementId?: string;
  };
  ads: {
    enabled: boolean;
    provider?: string;
    previewPlaceholders?: boolean;
    desktopChrome?: { enabled: boolean };
    placements?: Partial<Record<AdPlacement, boolean>>;
  };
  evidenceLabels: Array<{ label: string; note: LocalizedText }>;
  disclaimer: LocalizedText;
}
