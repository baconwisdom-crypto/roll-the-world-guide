import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PUBLIC_SOURCE_USES,
  readSiteConfigContract,
  validateSiteConfigContract,
  validateHeroMediaContract,
  validateHomepageMediaPresenceContract,
  validateBrandIconConfigContract,
  validatePrimaryActionContract,
  validatePrimaryActionRenderingContract,
  validatePublicSourceContract,
  validateRenderingSourceContract,
  validateNavigationIconContract,
  validateNavigationRenderingContract,
  validateHeaderBrandContract,
  validateMediaRenderingContract,
  validatePageContentContract,
} from "./framework-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const pages = JSON.parse(readFileSync(join(contentDir, "pages.json"), "utf8"));
const routes = JSON.parse(readFileSync(join(contentDir, "routes.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(contentDir, "sources.json"), "utf8"));
const locales = new Set(["en", "de", "fr", "es", "ja"]);
const failures = [];
const fail = (message) => failures.push(message);
const canonical = (route) => route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}/`;
const pageMap = new Map();
const sourceMap = new Map(sources.map((source) => [source.id, source]));
const publishedRoutes = new Set(pages.filter((page) => page.publicationStatus === "published").map((page) => canonical(page.route)));

for (const page of pages) {
  if (!page.page_id || pageMap.has(page.page_id)) fail(`duplicate or missing page_id: ${page.page_id}`);
  pageMap.set(page.page_id, page);
}

for (const page of pages) {
  if (!page.route || canonical(page.route) !== page.route) fail(`route is not canonical: ${page.page_id}`);
  if (!page.title?.en || !page.description?.en || !page.intro?.en) fail(`missing English page copy: ${page.page_id}`);
  for (const message of validatePrimaryActionContract(page, { pageMap, publishedRoutes })) fail(message);
  if (!page.localeAvailability?.length) fail(`missing localeAvailability: ${page.page_id}`);
  for (const locale of page.localeAvailability ?? []) if (!locales.has(locale)) fail(`unknown page locale ${locale}: ${page.page_id}`);
  if (!page.sourceIds || !Array.isArray(page.sourceIds)) fail(`missing sourceIds: ${page.page_id}`);
  for (const sourceId of page.sourceIds) if (!sourceMap.has(sourceId)) fail(`unknown source ${sourceId}: ${page.page_id}`);
  if (page.publicationStatus === "published") {
    for (const message of validatePublicSourceContract(page, sourceMap)) fail(message);
  }
  for (const section of page.sections ?? []) {
    if (!section.id || !section.title?.en) fail(`incomplete section ${page.page_id}/${section.id}`);
    for (const sourceId of section.sourceIds ?? []) if (!sourceMap.has(sourceId)) fail(`unknown section source ${sourceId}: ${page.page_id}`);
    for (const card of section.cards ?? []) if (card.pageId && !pageMap.has(card.pageId)) fail(`unknown card page ${card.pageId}: ${page.page_id}`);
  }
  const evidenceIds = new Set();
  for (const row of page.evidence ?? []) {
    if (!row.id || evidenceIds.has(row.id)) fail(`duplicate evidence id ${row.id}: ${page.page_id}`);
    evidenceIds.add(row.id);
    if (!row.statement?.en || !row.sourceId || !sourceMap.has(row.sourceId)) fail(`incomplete evidence row ${page.page_id}/${row.id}`);
  }
  for (const related of page.relatedPageIds ?? []) if (!pageMap.has(related)) fail(`unknown related page ${related}: ${page.page_id}`);
  for (const image of page.images ?? []) {
    if (!image.src || !image.alt?.en) fail(`incomplete image ${page.page_id}`);
    if (image.src.startsWith("/images/") && !existsSync(join(root, "public", image.src.slice(1)))) fail(`missing local image ${image.src}: ${page.page_id}`);
    if (image.sourceUrl && !/^https:\/\//.test(image.sourceUrl)) fail(`non-https image source ${image.src}: ${page.page_id}`);
    if (image.sourceArticleUrl && !/^https:\/\//.test(image.sourceArticleUrl)) fail(`non-https image article source ${image.src}: ${page.page_id}`);
  }
  const imageIds = new Set((page.images ?? []).map((image) => image.id ?? image.src));
  for (const section of page.sections ?? []) {
    for (const imageId of section.imageIds ?? []) if (!imageIds.has(imageId)) fail(`unknown section image ${imageId}: ${page.page_id}/${section.id}`);
  }
}

const routeMap = new Map(routes.map((entry) => [entry.route, entry.locales]));
for (const page of pages.filter((item) => item.publicationStatus === "published")) {
  const mapped = routeMap.get(page.route);
  if (!mapped) fail(`published page missing from routes.json: ${page.page_id}`);
  else if (JSON.stringify([...mapped].sort()) !== JSON.stringify([...page.localeAvailability].sort())) fail(`route locale map mismatch: ${page.page_id}`);
}
for (const route of routes) if (!pages.some((page) => page.route === route.route)) fail(`routes.json points to unknown page: ${route.route}`);

const sourceIds = new Set();
for (const source of sources) {
  if (!source.id || sourceIds.has(source.id)) fail(`duplicate source id: ${source.id}`);
  sourceIds.add(source.id);
  if (!source.name || !source.publisher || !source.lastChecked || !source.note?.en) fail(`incomplete source: ${source.id}`);
  if (source.url !== null && !/^https:\/\//.test(source.url)) fail(`non-https source URL: ${source.id}`);
  if (!PUBLIC_SOURCE_USES.has(source.publicUse)) fail(`invalid publicUse for source: ${source.id}`);
  if (source.publicUse === "official-first-party" && !/official/i.test(source.status)) fail(`public official source lacks Official status: ${source.id}`);
  if (source.publicUse === "official-first-party" && !source.url) fail(`public official source lacks URL: ${source.id}`);
}

const siteContract = readSiteConfigContract(join(root, "config", "site.ts"));
if (siteContract.searchVisibility === "public") {
  for (const page of pages.filter((item) => item.publicationStatus === "published")) {
    for (const section of page.sections ?? []) {
      if ((section.sourceIds ?? []).length) fail(`published section source block must be empty: ${page.page_id}/${section.id}`);
    }
  }
}
for (const message of validateSiteConfigContract(siteContract)) fail(message);
for (const message of validateBrandIconConfigContract(siteContract, { sourceMap, root })) fail(message);
for (const message of validateHeroMediaContract(siteContract, sourceMap)) fail(message);
const homepageMediaContract = validateHomepageMediaPresenceContract(siteContract);
for (const message of homepageMediaContract.failures) fail(message);
for (const message of homepageMediaContract.warnings) console.warn(`WARN ${message}`);
const navigationContract = validateNavigationIconContract({
  navigationIcons: siteContract.navigationIcons,
  pages,
});
for (const message of navigationContract.failures) fail(message);
for (const message of navigationContract.warnings) console.warn(`WARN ${message}`);
for (const message of validateRenderingSourceContract({
  contentImageSource: readFileSync(join(root, "components", "content-image.tsx"), "utf8"),
  guideArticleSource: readFileSync(join(root, "components", "guide-article.tsx"), "utf8"),
  sourceListSource: readFileSync(join(root, "components", "source-list.tsx"), "utf8"),
  showImageText: siteContract.showImageText,
})) fail(message);
for (const message of validateNavigationRenderingContract({
  navigationSource: readFileSync(join(root, "lib", "navigation.ts"), "utf8"),
  iconSource: readFileSync(join(root, "components", "navigation-icon.tsx"), "utf8"),
  sidebarSource: readFileSync(join(root, "components", "sidebar-content.tsx"), "utf8"),
  headerSource: readFileSync(join(root, "components", "site-header.tsx"), "utf8"),
  seoSource: readFileSync(join(root, "lib", "seo.ts"), "utf8"),
  cssSource: readFileSync(join(root, "app", "globals.css"), "utf8"),
})) fail(message);
for (const message of validateHeaderBrandContract({
  headerSource: readFileSync(join(root, "components", "site-header.tsx"), "utf8"),
  brandSource: readFileSync(join(root, "components", "site-brand-mark.tsx"), "utf8"),
  cssSource: readFileSync(join(root, "app", "globals.css"), "utf8"),
})) fail(message);
for (const message of validateMediaRenderingContract({
  guideArticleSource: readFileSync(join(root, "components", "guide-article.tsx"), "utf8"),
  contentImageSource: readFileSync(join(root, "components", "content-image.tsx"), "utf8"),
  cssSource: readFileSync(join(root, "app", "globals.css"), "utf8"),
})) fail(message);
for (const message of validatePageContentContract({
  englishLayoutSource: readFileSync(join(root, "app", "(en)", "layout.tsx"), "utf8"),
  localeLayoutSource: readFileSync(join(root, "app", "[locale]", "layout.tsx"), "utf8"),
  cssSource: readFileSync(join(root, "app", "globals.css"), "utf8"),
  sidebarSource: readFileSync(join(root, "components", "wiki-sidebar.tsx"), "utf8"),
})) fail(message);
for (const message of validatePrimaryActionRenderingContract({
  actionCardSource: readFileSync(join(root, "components", "action-card.tsx"), "utf8"),
  guideArticleSource: readFileSync(join(root, "components", "guide-article.tsx"), "utf8"),
})) fail(message);

const scanDirs = ["app", "components", "config", "content", "lib"];
const forbidden = /Zero Company|Star Wars|Hawks Best Build|Lucasfilm|Electronic Arts|Respawn Entertainment/i;
for (const dir of scanDirs) {
  const walk = (current) => {
    for (const entry of readdirSync(join(root, current), { withFileTypes: true })) {
      const relative = join(current, entry.name);
      if (entry.isDirectory()) walk(relative);
      else if (/\.(ts|tsx|json|css)$/.test(entry.name)) {
        const raw = readFileSync(join(root, relative), "utf8");
        if (forbidden.test(raw)) fail(`framework-specific game copy remains in ${relative}`);
        if (/lorem ipsum|TODO|[A-Z]:\\/i.test(raw)) fail(`placeholder or local path remains in ${relative}`);
      }
    }
  };
  walk(dir);
}

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log(`Content check passed: ${pages.length} pages, ${sources.length} sources, ${routes.length} route entries.`);
