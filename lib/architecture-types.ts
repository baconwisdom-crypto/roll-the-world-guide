import type { LocalizedText } from "./types";

export type PageTemplate = "landing" | "hub" | "catalog" | "procedure" | "comparison" | "troubleshooting";

export interface TaskDestination {
  pageId: string;
  anchor?: string;
  label: LocalizedText;
  description: LocalizedText;
}

export interface TopicGroup {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  hubPageId: string;
  pageIds: string[];
  featured: TaskDestination[];
}

export interface TaskJourney {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  stops: TaskDestination[];
}

export interface PageStructure {
  template: PageTemplate;
  displayTitle?: LocalizedText;
  deck?: LocalizedText;
  focusSectionIds: string[];
  groupIds: string[];
  journeyIds: string[];
  destinations: TaskDestination[];
  supportTitle: LocalizedText;
  scopeNote?: LocalizedText;
  /** A catalog section and a comparison section must contain actual records. */
  catalogSectionId?: string;
  comparisonSectionId?: string;
  procedure?: {
    title: LocalizedText;
    scope: LocalizedText;
    stages: Array<{ sectionId: string; action: LocalizedText; success: LocalizedText; fallback: LocalizedText }>;
  };
  issues?: Array<{ id: string; symptom: LocalizedText; check: LocalizedText; action: LocalizedText; outcome: LocalizedText; sourceNote: LocalizedText; sectionId: string; next?: TaskDestination }>;
}

export interface SiteStructure {
  version: 1;
  ui: Record<string, LocalizedText>;
  groups: TopicGroup[];
  journeys: TaskJourney[];
  pages: Record<string, PageStructure>;
}
