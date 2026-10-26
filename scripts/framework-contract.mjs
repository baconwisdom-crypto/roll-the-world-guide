import { stripComments } from "./strip-comments.mjs";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

export const PUBLIC_SOURCE_LIMIT = 3;
export const PUBLIC_SOURCE_USES = new Set(["official-first-party", "internal-only"]);
export const HERO_IMAGE_TYPES = new Set(["official-key-art", "official-promotional-image"]);
export const HERO_VIDEO_TYPES = new Set(["official-promotional-video"]);
export const HOME_HERO_VARIANTS = new Set(["compact-square", "wide-video"]);
export const SEARCH_VISIBILITIES = new Set(["public", "preview"]);
export const NAVIGATION_ICON_NAMES = new Set([
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
]);
export const BRAND_ICON_OUTPUTS = [
  { key: "favicon", relativePath: "public/favicon.ico" },
  { key: "icon192", relativePath: "public/icon-192.png" },
  { key: "appleTouch", relativePath: "public/apple-touch-icon.png" },
];

const literalField = (source, name) => {
  const match = new RegExp(`\\b${name}\\s*:\\s*`).exec(source);
  if (!match) return undefined;
  const start = match.index + match[0].length;
  const tail = source.slice(start);
  if (/^null\b/.test(tail)) return null;
  if (/^(true|false)\b/.test(tail)) return tail.match(/^(true|false)\b/)[1];
  if (tail[0] === "[") return tail.slice(0, tail.indexOf("]") + 1);
  if (tail[0] !== "{") return tail.match(/^[^,\n]+/)?.[0].trim();

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = 0; index < tail.length; index += 1) {
    const character = tail[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") quote = character;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return tail.slice(0, index + 1);
    }
  }
  return undefined;
};

const stringValue = (source, name) => {
  const value = literalField(source, name);
  return typeof value === "string" ? value.match(/^["']([^"']+)["']/)?.[1] : undefined;
};

const objectValue = (source, name) => {
  const value = literalField(source, name);
  return typeof value === "string" && value.startsWith("{") ? value : undefined;
};

const localizedValueHasEnglish = (source, name) => {
  const value = objectValue(source, name);
  return Boolean(value && /\ben\s*:/.test(value));
};

const brandIconValue = (source) => {
  if (source === undefined) return undefined;
  if (source === null) return null;
  return {
    src: stringValue(source, "src"),
    sourceId: stringValue(source, "sourceId"),
    altHasEnglish: localizedValueHasEnglish(source, "alt"),
  };
};

const heroValue = (source) => source === null
  ? null
  : {
      src: stringValue(source ?? "", "src"),
      heroMediaType: stringValue(source ?? "", "heroMediaType"),
      sourceId: stringValue(source ?? "", "sourceId"),
    };

const navigationIconValue = (source) => {
  if (!source) return undefined;
  const entries = {};
  for (const match of source.matchAll(/(?:["']([^"']+)["']|([A-Za-z0-9_-]+))\s*:\s*["']([^"']+)["']/g)) {
    entries[match[1] ?? match[2]] = match[3];
  }
  return entries;
};

export function readSiteConfigContract(configPath) {
  const raw = readFileSync(configPath, "utf8");
  const configStart = raw.indexOf("siteConfig");
  if (configStart < 0) throw new Error("siteConfig must be an object literal so prebuild contract checks can inspect it");
  const configObject = stripComments(raw.slice(configStart));
  const mediaPresentation = literalField(configObject, "mediaPresentation");
  const showImageText = literalField(mediaPresentation ?? "", "showImageText");
  const homeHeroVariant = stringValue(mediaPresentation ?? "", "homeHeroVariant");
  const searchVisibilityMatches = [...configObject.matchAll(/\bsearchVisibility\s*:\s*["'](public|preview)["']/g)];
  const navigationIconsSource = objectValue(configObject, "navigationIcons");
  return {
    siteUrl: stringValue(configObject, "siteUrl"),
    searchVisibility: searchVisibilityMatches.length === 1 ? searchVisibilityMatches[0][1] : undefined,
    searchVisibilityCount: searchVisibilityMatches.length,
    brandIcon: brandIconValue(literalField(configObject, "brandIcon")),
    navigationIcons: navigationIconValue(navigationIconsSource),
    heroImage: heroValue(literalField(configObject, "heroImage")),
    heroVideo: heroValue(literalField(configObject, "heroVideo")),
    showImageText: showImageText === "true" ? true : showImageText === "false" ? false : undefined,
    homeHeroVariant,
    publishedLocales: [...(literalField(configObject, "publishedLocales") ?? "").matchAll(/["'](en|de|fr|es|ja)["']/g)].map(m => m[1]),
    ads: {
      enabled: literalField(objectValue(configObject, "ads") ?? "", "enabled") === "true",
      previewPlaceholders: literalField(objectValue(configObject, "ads") ?? "", "previewPlaceholders") === "true",
      desktopChrome: literalField(objectValue(objectValue(configObject, "ads") ?? "", "desktopChrome") ?? "", "enabled") === "true",
      left: /["']left-sticky["']\s*:\s*true/.test(objectValue(objectValue(configObject, "ads") ?? "", "placements") ?? ""),
    },
  };
}

export function validateSiteConfigContract(config) {
  const failures = [];
  if (config.searchVisibility === "public" && config.ads?.previewPlaceholders) failures.push("public release must disable preview ad placeholders");
  if (config.publishedLocales && (!config.publishedLocales.length || !config.publishedLocales.includes("en"))) failures.push("publishedLocales must include en");
  if (config.searchVisibilityCount !== undefined && config.searchVisibilityCount !== 1) {
    failures.push("site config must contain exactly one literal searchVisibility field");
  }
  if (!SEARCH_VISIBILITIES.has(config.searchVisibility)) {
    failures.push("searchVisibility is required and must be public or preview");
  }
  if (!config.siteUrl) {
    failures.push("siteUrl must be a literal HTTPS URL");
    return failures;
  }
  let parsed;
  try {
    parsed = new URL(config.siteUrl);
  } catch {
    failures.push("siteUrl is not a valid URL");
    return failures;
  }
  const hostname = parsed.hostname.toLowerCase();
  const hostLabels = hostname.replace(/^\[|\]$/g, "").split(".");
  const vercelPreviewAlias = hostname.endsWith(".vercel.app") && /(^|[-.])(preview|staging|test|demo)([-.]|$)/.test(hostname);
  const placeholder = hostname === "localhost" || hostname.endsWith(".localhost") || hostname.startsWith("127.") || hostname === "::1" || hostname === "[::1]" || hostLabels.includes("example") || vercelPreviewAlias || /(^|[-.])(preview|staging|test|demo)([-.]|$)/.test(hostname);
  if (config.searchVisibility === "public" && (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || placeholder)) {
    failures.push("public searchVisibility requires a real HTTPS siteUrl, not a preview placeholder");
  }
  if (config.searchVisibility === "preview" && parsed.protocol !== "https:") {
    failures.push("preview searchVisibility still requires an HTTPS siteUrl");
  }
  return failures;
}

function localPublicPath(root, source) {
  if (typeof source !== "string" || !source.startsWith("/")) return null;
  if (source.includes("?") || source.includes("#")) return null;
  const publicRoot = resolve(root, "public");
  const candidate = resolve(publicRoot, `.${source}`);
  const relativePath = relative(publicRoot, candidate);
  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath)) return null;
  return candidate;
}

function parsePng(buffer) {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47 || buffer.readUInt32BE(4) !== 0x0d0a1a0a) return null;
  return { kind: "png", width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function parseJpeg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) return null;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) return null;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        kind: "jpeg",
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }
  return null;
}

function parseWebp(buffer) {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      kind: "webp",
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  return { kind: "webp", width: undefined, height: undefined };
}

function parseSvg(buffer) {
  const source = buffer.toString("utf8");
  if (!/<svg\b/i.test(source)) return null;
  const root = source.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  const width = Number.parseFloat(root.match(/\bwidth=["']([0-9.]+)/i)?.[1] ?? "");
  const height = Number.parseFloat(root.match(/\bheight=["']([0-9.]+)/i)?.[1] ?? "");
  if (Number.isFinite(width) && Number.isFinite(height)) return { kind: "svg", width, height };
  const viewBox = root.match(/\bviewBox=["']\s*([0-9.+-]+)\s+([0-9.+-]+)\s+([0-9.+-]+)\s+([0-9.+-]+)\s*["']/i);
  if (viewBox) return { kind: "svg", width: Number(viewBox[3]), height: Number(viewBox[4]) };
  return null;
}

function parseIco(buffer) {
  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) return null;
  const count = buffer.readUInt16LE(4);
  if (!count || buffer.length < 6 + count * 16) return null;
  const entries = [];
  for (let index = 0; index < count; index += 1) {
    const offset = 6 + index * 16;
    entries.push({
      width: buffer[offset] || 256,
      height: buffer[offset + 1] || 256,
      bytes: buffer.readUInt32LE(offset + 8),
      dataOffset: buffer.readUInt32LE(offset + 12),
    });
  }
  return { kind: "ico", entries };
}

function imageInfo(filePath) {
  const buffer = readFileSync(filePath);
  return parsePng(buffer) ?? parseJpeg(buffer) ?? parseWebp(buffer) ?? parseSvg(buffer) ?? parseIco(buffer);
}

export function validateBrandIconConfigContract(config, { sourceMap, root } = {}) {
  const failures = [];
  const brand = config.brandIcon;
  if (!brand || typeof brand !== "object") {
    failures.push("brandIcon is required in site config and must be an object");
    return failures;
  }
  if (!brand.src) failures.push("brandIcon.src is required");
  else if (!localPublicPath(root ?? process.cwd(), brand.src)) failures.push("brandIcon.src must be a local public path without a query or hash");
  if (!brand.sourceId) failures.push("brandIcon.sourceId is required");
  if (!brand.altHasEnglish) failures.push("brandIcon.alt must include an English value");
  if (brand.src && config.heroImage?.src && brand.src === config.heroImage.src) failures.push("brandIcon must remain separate from heroImage");
  if (sourceMap instanceof Map && brand.sourceId) {
    const source = sourceMap.get(brand.sourceId);
    if (!source) failures.push(`brandIcon references unknown source: ${brand.sourceId}`);
    else if (source.publicUse !== "official-first-party") failures.push(`brandIcon source is not first-party official: ${brand.sourceId}`);
  }
  return failures;
}

export function validateBrandIconAssetContract(config, { root } = {}) {
  const failures = [];
  const projectRoot = root ?? process.cwd();
  const sourcePath = localPublicPath(projectRoot, config.brandIcon?.src);
  if (!sourcePath || !existsSync(sourcePath)) {
    failures.push(`brandIcon source file is missing: ${config.brandIcon?.src ?? "missing"}`);
  } else {
    const sourceInfo = imageInfo(sourcePath);
    if (!sourceInfo) failures.push(`brandIcon source is not a recognized image: ${config.brandIcon.src}`);
    else if (sourceInfo.width === undefined || sourceInfo.height === undefined || sourceInfo.width !== sourceInfo.height) {
      failures.push(`brandIcon source must be square: ${config.brandIcon.src}`);
    }
  }

  const publicRoot = resolve(projectRoot, "public");
  for (const output of BRAND_ICON_OUTPUTS) {
    const outputPath = join(projectRoot, output.relativePath);
    if (!existsSync(outputPath)) {
      failures.push(`missing generated brand icon asset: ${output.relativePath}`);
      continue;
    }
    const info = imageInfo(outputPath);
    if (!info) {
      failures.push(`generated brand icon has an invalid format: ${output.relativePath}`);
      continue;
    }
    if (output.key === "favicon") {
      const sizes = new Set((info.kind === "ico" ? info.entries : []).flatMap((entry) => [entry.width, entry.height]));
      if (info.kind !== "ico" || !sizes.has(16) || !sizes.has(32)) failures.push("favicon.ico must be an ICO containing 16px and 32px entries");
    }
    if (output.key === "icon192" && (info.kind !== "png" || info.width !== 192 || info.height !== 192)) failures.push("icon-192.png must be a 192x192 PNG");
    if (output.key === "appleTouch" && (info.kind !== "png" || info.width !== 180 || info.height !== 180)) failures.push("apple-touch-icon.png must be a 180x180 PNG");
    const relativeOutput = relative(publicRoot, outputPath);
    if (relativeOutput.startsWith("..") || isAbsolute(relativeOutput)) failures.push(`generated brand icon target escaped public: ${output.relativePath}`);
  }
  return failures;
}

export function validateNavigationIconContract({ navigationIcons, pages = [] }) {
  const failures = [];
  const warnings = [];
  if (!navigationIcons || typeof navigationIcons !== "object") {
    failures.push("navigationIcons is required in site config");
    return { failures, warnings };
  }
  for (const [key, value] of Object.entries(navigationIcons)) {
    if (!NAVIGATION_ICON_NAMES.has(value)) failures.push(`unsupported navigation icon ${value} for ${key}`);
  }
  const publishedNavigationPages = pages.filter(
    (page) => page.publicationStatus === "published" && page.navigation && page.route !== "/",
  );
  for (const page of publishedNavigationPages) {
    const sectionKey = String(page.section ?? "").toLowerCase();
    const icon = navigationIcons[page.page_id] ?? navigationIcons[page.section] ?? navigationIcons[sectionKey];
    if (!icon) warnings.push(`navigationIcons missing ${page.page_id}; fallback overview will render`);
  }
  return { failures, warnings };
}

export function validateNavigationRenderingContract({ navigationSource, iconSource, sidebarSource, headerSource, seoSource, cssSource }) {
  const failures = [];
  if (!navigationSource.includes("navigationIcons") || !navigationSource.includes("FALLBACK_NAVIGATION_ICON")) failures.push("lib/navigation.ts does not resolve configured icons with a stable fallback");
  if (!iconSource.includes("NavigationIconName") || !iconSource.includes("aria-hidden") || !iconSource.includes("currentColor")) failures.push("NavigationIcon lacks the restricted type or inline SVG accessibility contract");
  if (!sidebarSource.includes("<NavigationIcon") || !sidebarSource.includes("aria-current") || !sidebarSource.includes("onToggle") || !sidebarSource.includes("openGroups")) failures.push("WikiSidebar content lacks icons, current-route state, or shared disclosure behavior");
  if (!headerSource.includes("SiteBrandMark") || !headerSource.includes("site-brand__name")) failures.push("SiteHeader does not render the configured brand mark and full site-name contract");
  if (!seoSource.includes("BRAND_ICON_METADATA") || !seoSource.includes("icons:")) failures.push("root metadata does not declare brand icon outputs");
  if (!cssSource.includes(".sidebar-group-summary:hover") || !cssSource.includes(".sidebar-link[aria-current=\"page\"]") || !cssSource.includes("@media (prefers-reduced-motion: reduce)")) failures.push("navigation interaction states or reduced-motion handling are missing");
  return failures;
}

export function validateHeaderBrandContract({ headerSource, brandSource, cssSource }) {
  const failures = [];
  const headerRoot = headerSource.match(/<header\b[^>]*>/)?.[0] ?? "";
  if (/\b(?:sticky|fixed|top-0|top-\[[^\]]+\]|inset-0)\b/.test(headerRoot) || /position\s*:\s*(?:fixed|sticky)/.test(headerRoot)) {
    failures.push("SiteHeader root must remain in normal document flow without fixed positioning");
  }
  if (headerSource.includes("truncate") && headerSource.includes("SITE_NAME")) failures.push("SiteHeader still truncates SITE_NAME");
  if (!headerSource.includes("site-header-brand-row") || !headerSource.includes("site-header-navigation-row")) failures.push("SiteHeader does not reserve a separate navigation row for long names");
  if (!headerSource.includes("aria-label={SITE_NAME}") || !headerSource.includes("{SITE_NAME}")) failures.push("SiteHeader does not expose the full site name as the brand label and visible text");
  if (!brandSource.includes('alt=""') || !brandSource.includes("aria-hidden") || !brandSource.includes("naturalWidth")) failures.push("SiteBrandMark lacks decorative image semantics or cached-load fallback handling");
  if (!cssSource.includes(".site-brand__name") || !cssSource.includes("overflow-wrap: anywhere")) failures.push("full site-name wrapping is not protected by the UI foundation");
  if (!cssSource.includes("@media (max-width: 30rem)") || !cssSource.includes("overflow-x: visible")) failures.push("narrow Header does not keep mobile navigation available without clipping");
  return failures;
}

export function validateMediaRenderingContract({ guideArticleSource, contentImageSource, cssSource = "" }) {
  const failures = [];
  if (!guideArticleSource.includes("isCompactMedia") || !guideArticleSource.includes("videoImages") || !guideArticleSource.includes("compactImages")) failures.push("GuideArticle does not classify video and compact media separately");
  if (!guideArticleSource.includes('data-media-layout="video-stack"') || !guideArticleSource.includes("space-y-5")) failures.push("video media is not rendered as a full-width vertical stack");
  if (!guideArticleSource.includes('data-media-layout="compact-grid"') || !guideArticleSource.includes("xl:grid-cols-3")) failures.push("compact media does not use the reusable multi-column layout");
  if (!contentImageSource.includes("sizes?: string") || !contentImageSource.includes("sizes={sizes ?? ARTICLE_MEDIA_SIZES}")) failures.push("ContentImage does not accept the layout-specific full-column sizes contract");
  if (contentImageSource.includes("48rem, (min-width: 768px) 70vw")) failures.push("ContentImage still reports the old half-column 48rem sizes value");
  if (!guideArticleSource.includes("homeHeroVariant") || !guideArticleSource.includes("HERO_COMPACT_MEDIA_SIZES")) failures.push("HomeMedia does not resolve compact-square and wide-video presentation variants");
  if (!cssSource.includes(".home-hero-media--compact-square") || !cssSource.includes(".home-hero-media--wide-video") || !cssSource.includes("--ui-home-hero-square-max") || !cssSource.includes("@media (max-width: 47.99rem)")) failures.push("homepage media width tokens or mobile full-width behavior are missing");
  return failures;
}

export function validatePublicSourceContract(page, sourceMap) {
  const failures = [];
  const ids = page.sourceIds ?? [];
  if (ids.length > PUBLIC_SOURCE_LIMIT) {
    failures.push(`public sources exceed ${PUBLIC_SOURCE_LIMIT}: ${page.page_id}`);
  }
  if (new Set(ids).size !== ids.length) failures.push(`duplicate public source id: ${page.page_id}`);
  for (const sourceId of ids) {
    const source = sourceMap.get(sourceId);
    if (!source) continue;
    if (source.publicUse !== "official-first-party") {
      failures.push(`non-official source in public source block ${sourceId}: ${page.page_id}`);
    }
    if (!source.url) failures.push(`public source has no URL ${sourceId}: ${page.page_id}`);
  }
  return failures;
}

export function validateHeroMediaContract(config, sourceMap) {
  const failures = [];
  const check = (hero, allowedTypes, label) => {
    if (!hero) return;
    if (!allowedTypes.has(hero.heroMediaType)) failures.push(`${label} has disallowed media type: ${hero.heroMediaType ?? "missing"}`);
    if (!hero.sourceId) {
      failures.push(`${label} is missing sourceId`);
      return;
    }
    const source = sourceMap.get(hero.sourceId);
    if (!source) failures.push(`${label} references unknown source: ${hero.sourceId}`);
    else if (source.publicUse !== "official-first-party") failures.push(`${label} source is not first-party official: ${hero.sourceId}`);
  };
  check(config.heroImage, HERO_IMAGE_TYPES, "heroImage");
  check(config.heroVideo, HERO_VIDEO_TYPES, "heroVideo");
  if (typeof config.showImageText !== "boolean") failures.push("mediaPresentation.showImageText must be a boolean literal");
  if (config.homeHeroVariant !== undefined && !HOME_HERO_VARIANTS.has(config.homeHeroVariant)) {
    failures.push(`mediaPresentation.homeHeroVariant is unsupported: ${config.homeHeroVariant}`);
  }
  return failures;
}

export function validateHomepageMediaPresenceContract(config) {
  const failures = [];
  const warnings = [];
  if (config.heroImage || config.heroVideo) return { failures, warnings };
  const message = "homepage has no heroImage or heroVideo; configure approved homepage media before public release";
  if (config.searchVisibility === "public") failures.push(message);
  else warnings.push(`${message}; preview keeps an explicit empty-media warning`);
  return { failures, warnings };
}

export function validatePageContentContract({ englishLayoutSource, localeLayoutSource, cssSource, sidebarSource = "" }) {
  const failures = [];
  for (const [label, source] of [["English", englishLayoutSource], ["locale", localeLayoutSource]]) {
    if (!source.includes('<main className="page-content')) failures.push(`${label} layout main is missing the shared page-content container`);
    if (!source.includes("px-4 py-6 sm:px-6 sm:py-8") || !source.includes("lg:grid-cols-[15rem_minmax(0,1fr)]")) {
      failures.push(`${label} layout is missing the shared 15rem sidebar track and outer gutters`);
    }
    if (/<WikiSidebar\b[^>]*className\s*=\s*["'{][^>]*\bpage-content\b/.test(source)) {
      failures.push(`${label} layout applies page-content padding to WikiSidebar`);
    }
    const pageContentTags = [...source.matchAll(/<([A-Za-z][A-Za-z0-9.]*)\b[^>]*\bpage-content\b[^>]*>/g)].map((match) => match[1]);
    if (pageContentTags.length !== 1 || pageContentTags[0] !== "main") failures.push(`${label} layout must use page-content only on the main content container`);
  }
  if (/\bpage-content\b/.test(sidebarSource)) failures.push("WikiSidebar must not carry page-content; only the main content container may use it");
  if (!cssSource.includes(".page-content") || !cssSource.includes("--ui-page-content-padding") || !cssSource.includes("clamp(1rem, 0.5rem + 2vw, 2rem)")) {
    failures.push("page-content lacks the tokenized responsive padding contract");
  }
  return failures;
}

export function validateRenderingSourceContract({ contentImageSource, guideArticleSource, sourceListSource, showImageText }) {
  const failures = [];
  if (/function\s+MediaAttribution|<MediaAttribution\b/.test(guideArticleSource)) failures.push("GuideArticle still renders MediaAttribution");
  if (guideArticleSource.includes("Section sources")) failures.push("GuideArticle still renders section source headings");
  if (guideArticleSource.includes("Media is labeled with its source record and retained evidence boundary.")) failures.push("HomeMedia evidence microcopy remains");
  if ((guideArticleSource.match(/<SourceList\b/g) ?? []).length !== 1) failures.push("GuideArticle must render exactly one public source block");
  if (/page\.images\s*\[\s*0\s*\]/.test(guideArticleSource)) failures.push("GuideArticle selects a page screenshot as hero media");
  if (!contentImageSource.includes("alt={image.alt}")) failures.push("ContentImage no longer preserves alt text");
  if (showImageText === false && !contentImageSource.includes("siteConfig.mediaPresentation.showImageText")) {
    failures.push("ContentImage does not honor the default-off image text setting");
  }
  if (!sourceListSource.includes("resolvePublicSources") || !sourceListSource.includes("data-public-sources")) {
    failures.push("SourceList does not enforce the official public source contract");
  }
  return failures;
}

const normalizeRoutePath = (route) => (route === "/" ? "/" : `/${String(route).replace(/^\/+|\/+$/g, "")}/`);

/**
 * The single homepage action is content-layer configuration. A published Home
 * page must declare exactly one target, and that target must resolve to a
 * published in-site page (pageId) or a published in-site route (href). Other
 * page types may omit primaryAction entirely.
 */
export function validatePrimaryActionContract(page, { pageMap, publishedRoutes }) {
  const failures = [];
  const action = page.primaryAction;
  const publishedHome = page.pageType === "Home" && page.publicationStatus === "published";
  if (!action) {
    if (publishedHome) failures.push(`published Home page requires a primaryAction: ${page.page_id}`);
    return failures;
  }
  if (!action.label?.en) failures.push(`primaryAction requires a localized label: ${page.page_id}`);
  const hasPageId = Boolean(action.pageId);
  const hasHref = Boolean(action.href);
  if (hasPageId === hasHref) {
    failures.push(`primaryAction must set exactly one of pageId or href: ${page.page_id}`);
    return failures;
  }
  if (hasPageId) {
    const target = pageMap.get(action.pageId);
    if (!target) failures.push(`primaryAction references unknown page ${action.pageId}: ${page.page_id}`);
    else if (target.publicationStatus !== "published") failures.push(`primaryAction page target is not published ${action.pageId}: ${page.page_id}`);
    return failures;
  }
  if (!action.href.startsWith("/")) {
    failures.push(`primaryAction href must be an in-site path: ${page.page_id}`);
    return failures;
  }
  if (!publishedRoutes.has(normalizeRoutePath(action.href))) {
    failures.push(`primaryAction href does not resolve to a published route ${action.href}: ${page.page_id}`);
  }
  return failures;
}

/**
 * Guards the split between the generic ActionCard and the ordinary article
 * quick answer: the renderer must branch on the action, keep the notice-panel
 * fallback, and the card itself must stay free of hardcoded copy or targets.
 */
export function validatePrimaryActionRenderingContract({ actionCardSource, guideArticleSource }) {
  const failures = [];
  if (!/<ActionCard\b/.test(guideArticleSource)) failures.push("GuideArticle does not render the primary action card");
  if (!/<NoticePanel\b/.test(guideArticleSource) || !/<StatusBadge\b/.test(guideArticleSource)) {
    failures.push("GuideArticle no longer keeps the quick-answer notice panel and status badge fallback");
  }
  if (!/<Link\b/.test(actionCardSource)) failures.push("ActionCard does not render a locale-aware Link");
  if (!/\{\s*action\.label\s*\}/.test(actionCardSource)) failures.push("ActionCard does not render the caller-supplied label");
  if (/\bpageId\b/.test(actionCardSource)) failures.push("ActionCard hardcodes a page id");
  if (/href\s*=\s*["'`]\/[^"'`]*["'`]/.test(actionCardSource)) failures.push("ActionCard hardcodes a link target");
  return failures;
}
