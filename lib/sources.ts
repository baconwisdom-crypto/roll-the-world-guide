import { sources } from "@/content/sources";
import type { SourceRecord } from "@/lib/types";

const byId = new Map(sources.map((source) => [source.id, source]));

export const PUBLIC_SOURCE_LIMIT = 3;

export function getSource(id: string): SourceRecord | undefined {
  return byId.get(id);
}

export function resolveSources(ids: readonly string[] = []): SourceRecord[] {
  return ids
    .map((id) => byId.get(id))
    .filter((source): source is SourceRecord => Boolean(source));
}

export function isPublicOfficialSource(source: SourceRecord): boolean {
  return source.publicUse === "official-first-party" && Boolean(source.url);
}

export function resolvePublicSources(ids: readonly string[] = []): SourceRecord[] {
  return resolveSources(ids)
    .filter(isPublicOfficialSource)
    .slice(0, PUBLIC_SOURCE_LIMIT);
}

export function allSources(): SourceRecord[] {
  return sources;
}

export type StatusTone =
  | "official"
  | "media"
  | "community"
  | "wiki"
  | "unconfirmed"
  | "mixed"
  | "neutral";

export function statusTone(status: string): StatusTone {
  const value = status.toLowerCase();
  if (value.includes("unconfirmed") || value.includes("pending") || value.includes("theory")) {
    return "unconfirmed";
  }
  if (value.includes("official")) return "official";
  if (value.includes("media") || value.includes("preview")) return "media";
  if (value.includes("community")) return "community";
  if (value.includes("wiki")) return "wiki";
  return "neutral";
}
