import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readSiteConfigContract,
  validateBrandIconConfigContract,
  validateHeroMediaContract,
  validateHomepageMediaPresenceContract,
  validateNavigationIconContract,
  validateNavigationRenderingContract,
  validateHeaderBrandContract,
  validateMediaRenderingContract,
  validatePageContentContract,
  validatePrimaryActionContract,
  validatePrimaryActionRenderingContract,
  validatePublicSourceContract,
  validateRenderingSourceContract,
  validateSiteConfigContract,
} from "./framework-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const official = { id: "official", url: "https://example.com", publicUse: "official-first-party" };
const internal = { id: "internal", url: "https://example.net", publicUse: "internal-only" };
const sourceMap = new Map([[official.id, official], [internal.id, internal]]);

assert.match(
  validatePublicSourceContract({ page_id: "too-many", sourceIds: ["official", "official", "official", "official"] }, sourceMap).join("\n"),
  /exceed 3/,
);
assert.match(
  validatePublicSourceContract({ page_id: "leak", sourceIds: ["internal"] }, sourceMap).join("\n"),
  /non-official source/,
);
assert.match(
  validateHeroMediaContract({ heroImage: { heroMediaType: "gameplay-screenshot", sourceId: "official" }, heroVideo: null, showImageText: false }, sourceMap).join("\n"),
  /disallowed media type/,
);
assert.match(
  validateHeroMediaContract({ heroImage: { heroMediaType: "official-key-art", sourceId: "internal" }, heroVideo: null, showImageText: false }, sourceMap).join("\n"),
  /not first-party official/,
);

const config = readSiteConfigContract(join(root, "config", "site.ts"));
const adSlotSource = readFileSync(join(root, "components", "ad-slot.tsx"), "utf8");
const adChromeSource = readFileSync(join(root, "components", "ad-chrome.tsx"), "utf8");
const dismissibleTopAdSource = readFileSync(join(root, "components", "dismissible-top-ad.tsx"), "utf8");
const structuredPageSource = readFileSync(join(root, "components", "structured-page.tsx"), "utf8");
const registeredPageSource = readFileSync(join(root, "components", "registered-page.tsx"), "utf8");
const guideArticleNavigationSource = readFileSync(join(root, "components", "guide-article.tsx"), "utf8");
const siteConfigSource = readFileSync(join(root, "config", "site.ts"), "utf8");
assert.match(adSlotSource, /data-ad-placement/);
assert.match(adChromeSource, /top-sticky/);
assert.match(adChromeSource, /left-sticky/);
assert.match(dismissibleTopAdSource, /Close top advertisement/);
assert.match(dismissibleTopAdSource, /classList\.remove\("has-top-ad"\)/);
assert.match(structuredPageSource, /home-banner/);
assert.match(structuredPageSource, /article-banner/);
assert.match(structuredPageSource, /ArticleSections/);
assert.doesNotMatch(structuredPageSource, /placement="sidebar-square"/);
assert.match(guideArticleNavigationSource, /articleAdAfter/);
assert.doesNotMatch(structuredPageSource, /<Journeys/);
assert.doesNotMatch(structuredPageSource, /arch-topic-more/);
assert.doesNotMatch(registeredPageSource, /arch-legacy-grid/);
assert.match(guideArticleNavigationSource, /Continue in this section/);
assert.match(guideArticleNavigationSource, /sectionArticles\[currentIndex - 1\]/);
assert.match(guideArticleNavigationSource, /sectionArticles\[currentIndex \+ 1\]/);
assert.equal(typeof config.ads.previewPlaceholders, "boolean");
assert.ok(config.searchVisibility !== "public" || !config.ads.previewPlaceholders, "public release must not render preview ad placeholders");
assert.equal(typeof config.ads.desktopChrome, "boolean");
assert.equal(typeof config.ads.left, "boolean", "rail intent is configuration dependent; rendered spacing is checked after build");
const adCssSource = readFileSync(join(root, "app", "architecture.css"), "utf8");
assert.match(adCssSource, /@media \(min-width: 1280px\) and \(min-height: 700px\)/);
assert.match(adCssSource, /body\.has-left-ad:has\(\.site-left-ad-rail > \.ad-slot--vertical-rail\)\s*\{[^}]*padding-left: 192px/,
  "left spacing requires a rendered narrow rail");
assert.doesNotMatch(adCssSource, /body\.has-left-ad\s*\{[^}]*padding-left/,
  "an empty rail must not reserve body padding");
assert.match(adCssSource, /\.ad-slot--vertical-rail\s*\{[^}]*max-width: 160px/);
assert.equal(config.showImageText, false, "framework image text must default to off");
assert.ok(["preview", "public"].includes(config.searchVisibility), "search visibility must use a supported mode");
assert.deepEqual(validateSiteConfigContract(config), []);
assert.deepEqual(validateSiteConfigContract({ siteUrl: "https://guides.gg", searchVisibility: "public" }), []);
assert.match(validateSiteConfigContract({ siteUrl: "https://guides.gg", searchVisibility: "public", ads: { previewPlaceholders: true } }).join("\n"), /disable preview ad placeholders/);
assert.deepEqual(validateSiteConfigContract({ siteUrl: "https://guides.gg", searchVisibility: "public", ads: { previewPlaceholders: false, left: true } }), []);
assert.match(validateSiteConfigContract({ siteUrl: "https://example.test", searchVisibility: "public" }).join("\n"), /preview placeholder/);
assert.deepEqual(validateSiteConfigContract({ siteUrl: "https://dimraeth-guide.vercel.app", searchVisibility: "public" }), []);
assert.match(validateSiteConfigContract({ siteUrl: "https://demo.vercel.app", searchVisibility: "public" }).join("\n"), /preview placeholder/);
assert.match(validateSiteConfigContract({ siteUrl: "http://guides.example.com", searchVisibility: "public" }).join("\n"), /real HTTPS/);
assert.match(validateSiteConfigContract({ siteUrl: "https://localhost:3000", searchVisibility: "public" }).join("\n"), /preview placeholder/);
assert.match(validateSiteConfigContract({ siteUrl: "https://127.0.0.1", searchVisibility: "public" }).join("\n"), /preview placeholder/);
assert.match(validateSiteConfigContract({ siteUrl: "https://guides.gg", searchVisibility: "public", searchVisibilityCount: 2 }).join("\n"), /exactly one/);
assert.match(validateSiteConfigContract({ siteUrl: "https://example.test" }).join("\n"), /required/);
const configuredSourceMap = new Map(sourceMap);
if (config.heroImage?.sourceId) {
  configuredSourceMap.set(config.heroImage.sourceId, {
    id: config.heroImage.sourceId,
    url: config.heroImage.sourceUrl ?? "https://configured.example",
    publicUse: "official-first-party",
  });
}
assert.deepEqual(validateHeroMediaContract(config, configuredSourceMap), []);
assert.match(
  validateHomepageMediaPresenceContract({ heroImage: null, heroVideo: null, searchVisibility: "preview" }).warnings.join("\n"),
  /explicit empty-media warning/,
);
assert.match(
  validateHomepageMediaPresenceContract({ heroImage: null, heroVideo: null, searchVisibility: "public" }).failures.join("\n"),
  /before public release/,
);
assert.match(
  validateHeroMediaContract({ heroImage: null, heroVideo: null, showImageText: false, homeHeroVariant: "unsupported" }, sourceMap).join("\n"),
  /homeHeroVariant is unsupported/,
);
assert.deepEqual(
  validateBrandIconConfigContract(
    {
      brandIcon: { src: "/brand-icon-source.svg", sourceId: "official", altHasEnglish: true },
      heroImage: null,
    },
    { sourceMap, root },
  ),
  [],
);
assert.match(
  validateBrandIconConfigContract(
    {
      brandIcon: { src: "/hero.png", sourceId: "internal", altHasEnglish: false },
      heroImage: { src: "/hero.png" },
    },
    { sourceMap, root },
  ).join("\n"),
  /local public path|alt|separate from heroImage|not first-party official/,
);

const navigationContract = validateNavigationIconContract({
  navigationIcons: { guides: "guides", broken: "unknown" },
  pages: [
    { page_id: "guides-hub", route: "/guides/", section: "Guides", publicationStatus: "published", navigation: { order: 1 } },
    { page_id: "sources", route: "/sources/", section: "Sources", publicationStatus: "published", navigation: { order: 2 } },
  ],
});
assert.match(navigationContract.failures.join("\n"), /unsupported navigation icon/);
assert.match(navigationContract.warnings.join("\n"), /sources/);

const navigationRendering = {
  navigationSource: readFileSync(join(root, "lib", "navigation.ts"), "utf8"),
  iconSource: readFileSync(join(root, "components", "navigation-icon.tsx"), "utf8"),
  sidebarSource: readFileSync(join(root, "components", "sidebar-content.tsx"), "utf8"),
  headerSource: readFileSync(join(root, "components", "site-header.tsx"), "utf8"),
  seoSource: readFileSync(join(root, "lib", "seo.ts"), "utf8"),
  cssSource: readFileSync(join(root, "app", "globals.css"), "utf8"),
};
assert.deepEqual(validateNavigationRenderingContract(navigationRendering), []);
assert.match(
  validateNavigationRenderingContract({ ...navigationRendering, sidebarSource: "<NavigationIcon />" }).join("\n"),
  /lacks icons/,
);

const headerMediaRendering = {
  headerSource: readFileSync(join(root, "components", "site-header.tsx"), "utf8"),
  brandSource: readFileSync(join(root, "components", "site-brand-mark.tsx"), "utf8"),
  cssSource: readFileSync(join(root, "app", "globals.css"), "utf8"),
  guideArticleSource: readFileSync(join(root, "components", "guide-article.tsx"), "utf8"),
  contentImageSource: readFileSync(join(root, "components", "content-image.tsx"), "utf8"),
};
assert.deepEqual(validateHeaderBrandContract(headerMediaRendering), []);
assert.match(
  validateHeaderBrandContract({ ...headerMediaRendering, headerSource: "<span className=\"truncate\">{SITE_NAME}</span>" }).join("\n"),
  /still truncates SITE_NAME/,
);
assert.match(
  validateHeaderBrandContract({ ...headerMediaRendering, headerSource: "<header className=\"sticky top-0\"></header>" }).join("\n"),
  /normal document flow without fixed positioning/,
);
assert.deepEqual(validateMediaRenderingContract(headerMediaRendering), []);
assert.match(
  validateMediaRenderingContract({ ...headerMediaRendering, guideArticleSource: "function GuideArticle() {}" }).join("\n"),
  /classify video and compact media/,
);
assert.match(
  validateMediaRenderingContract({ ...headerMediaRendering, cssSource: "" }).join("\n"),
  /homepage media width tokens/,
);

const pageContentLayouts = {
  englishLayoutSource: readFileSync(join(root, "app", "(en)", "layout.tsx"), "utf8"),
  localeLayoutSource: readFileSync(join(root, "app", "[locale]", "layout.tsx"), "utf8"),
  cssSource: readFileSync(join(root, "app", "globals.css"), "utf8"),
  sidebarSource: readFileSync(join(root, "components", "wiki-sidebar.tsx"), "utf8"),
};
assert.deepEqual(validatePageContentContract(pageContentLayouts), []);
assert.match(
  validatePageContentContract({ ...pageContentLayouts, englishLayoutSource: "<main className=\"min-w-0\">" }).join("\n"),
  /missing the shared page-content container/,
);
assert.match(
  validatePageContentContract({ ...pageContentLayouts, englishLayoutSource: '<div className="grid lg:grid-cols-[12rem_minmax(0,1fr)]"><WikiSidebar /><main className="page-content min-w-0" /></div>' }).join("\n"),
  /missing the shared 15rem sidebar track and outer gutters/,
);
assert.match(
  validatePageContentContract({ ...pageContentLayouts, englishLayoutSource: '<div className="px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[15rem_minmax(0,1fr)]"><WikiSidebar className="page-content" /><main className="page-content min-w-0" /></div>' }).join("\n"),
  /applies page-content padding to WikiSidebar/,
);
assert.match(
  validatePageContentContract({ ...pageContentLayouts, localeLayoutSource: pageContentLayouts.localeLayoutSource.replace("sm:px-6", "sm:px-4") }).join("\n"),
  /missing the shared 15rem sidebar track and outer gutters/,
);
assert.match(
  validatePageContentContract({ ...pageContentLayouts, sidebarSource: '<aside className="page-content sidebar-scroll"></aside>' }).join("\n"),
  /WikiSidebar must not carry page-content/,
);
assert.match(
  validatePageContentContract({
    ...pageContentLayouts,
    englishLayoutSource: pageContentLayouts.englishLayoutSource.replace('<main className="page-content min-w-0">', '<div className="page-content"><main className="min-w-0">'),
  }).join("\n"),
  /only on the main content container/,
);

const renderingContract = {
  contentImageSource: readFileSync(join(root, "components", "content-image.tsx"), "utf8"),
  guideArticleSource: readFileSync(join(root, "components", "guide-article.tsx"), "utf8"),
  sourceListSource: readFileSync(join(root, "components", "source-list.tsx"), "utf8"),
  showImageText: false,
};
assert.deepEqual(validateRenderingSourceContract(renderingContract), []);
assert.match(
  validateRenderingSourceContract({ ...renderingContract, contentImageSource: "alt={image.alt}" }).join("\n"),
  /does not honor the default-off image text setting/,
);
assert.match(
  validateRenderingSourceContract({ ...renderingContract, guideArticleSource: "function MediaAttribution() {} <SourceList />" }).join("\n"),
  /still renders MediaAttribution/,
);

const homeBase = { page_id: "home", pageType: "Home", publicationStatus: "published" };
const guideTarget = { page_id: "guide", pageType: "Hub", publicationStatus: "published" };
const plannedTarget = { page_id: "planned", pageType: "Hub", publicationStatus: "planned" };
const actionContext = {
  pageMap: new Map([
    [homeBase.page_id, homeBase],
    [guideTarget.page_id, guideTarget],
    [plannedTarget.page_id, plannedTarget],
  ]),
  publishedRoutes: new Set(["/", "/guides/"]),
};
const validAction = { label: { en: "Getting Started" }, pageId: "guide" };

assert.match(
  validatePrimaryActionContract({ ...homeBase }, actionContext).join("\n"),
  /requires a primaryAction/,
);
assert.deepEqual(validatePrimaryActionContract({ ...homeBase, primaryAction: validAction }, actionContext), []);
assert.deepEqual(
  validatePrimaryActionContract({ ...homeBase, primaryAction: { label: { en: "Open" }, href: "/guides/" } }, actionContext),
  [],
);
assert.match(
  validatePrimaryActionContract({ ...homeBase, primaryAction: { label: { en: "Open" }, pageId: "guide", href: "/guides/" } }, actionContext).join("\n"),
  /exactly one of pageId or href/,
);
assert.match(
  validatePrimaryActionContract({ ...homeBase, primaryAction: { label: { en: "Open" } } }, actionContext).join("\n"),
  /exactly one of pageId or href/,
);
assert.match(
  validatePrimaryActionContract({ ...homeBase, primaryAction: { label: { en: "Open" }, pageId: "missing" } }, actionContext).join("\n"),
  /unknown page/,
);
assert.match(
  validatePrimaryActionContract({ ...homeBase, primaryAction: { label: { en: "Open" }, pageId: "planned" } }, actionContext).join("\n"),
  /not published/,
);
assert.match(
  validatePrimaryActionContract({ ...homeBase, primaryAction: { label: { en: "Open" }, href: "/missing/" } }, actionContext).join("\n"),
  /does not resolve/,
);
assert.match(
  validatePrimaryActionContract({ ...homeBase, primaryAction: { label: { en: "Open" }, href: "https://example.com" } }, actionContext).join("\n"),
  /in-site path/,
);
assert.deepEqual(
  validatePrimaryActionContract({ page_id: "article", pageType: "GuideArticle", publicationStatus: "published" }, actionContext),
  [],
  "non-Home pages may omit primaryAction",
);

const actionRendering = {
  actionCardSource: readFileSync(join(root, "components", "action-card.tsx"), "utf8"),
  guideArticleSource: readFileSync(join(root, "components", "guide-article.tsx"), "utf8"),
};
assert.deepEqual(validatePrimaryActionRenderingContract(actionRendering), []);
assert.match(
  validatePrimaryActionRenderingContract({ ...actionRendering, guideArticleSource: "function GuideArticle() {}" }).join("\n"),
  /does not render the primary action card/,
);
assert.match(
  validatePrimaryActionRenderingContract({ ...actionRendering, guideArticleSource: "<ActionCard /> <NoticePanel />" }).join("\n"),
  /status badge fallback/,
);
assert.match(
  validatePrimaryActionRenderingContract({ ...actionRendering, actionCardSource: 'export function ActionCard(){ return <Link href="/guides/">{action.label}</Link>; }' }).join("\n"),
  /hardcodes a link target/,
);
assert.match(
  validatePrimaryActionRenderingContract({ ...actionRendering, actionCardSource: 'export function ActionCard(){ return <Link href={action.href}>Read more</Link>; }' }).join("\n"),
  /caller-supplied label/,
);

console.log("Contract tests passed: search visibility, public source limits, official-only sources, hero media, homepage media presence, page-content padding and placement, sidebar layout, media variants, default image text behavior, and the single homepage primary action are enforced.");
