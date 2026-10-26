import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readSiteConfigContract,
  validateBrandIconAssetContract,
  validateSiteConfigContract,
} from "./framework-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = JSON.parse(readFileSync(join(root, "content", "pages.json"), "utf8"));
const siteContract = readSiteConfigContract(join(root, "config", "site.ts"));
const siteContractFailures = validateSiteConfigContract(siteContract);
siteContractFailures.push(...validateBrandIconAssetContract(siteContract, { root }));
if (siteContractFailures.length) {
  siteContractFailures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
const manifestPath = join(root, ".next", "prerender-manifest.json");
if (!existsSync(manifestPath)) {
  console.error("FAIL missing .next/prerender-manifest.json");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const siteOrigin = new URL(siteContract.siteUrl).origin;
const normalize = (route) => route.replace(/\/+$/, "") || "/";
const rendered = new Set(Object.keys(manifest.routes ?? {}).map(normalize));
const failures = [];
const expected = [];
for (const page of pages.filter((item) => item.publicationStatus === "published")) {
  for (const locale of page.localeAvailability.filter(locale => siteContract.publishedLocales.includes(locale))) {
    expected.push(locale === "en" ? page.route : `/${locale}${page.route}`);
  }
}
const expectedBuiltPaths = new Set(expected.map(normalize));
for (const route of expected) if (!rendered.has(normalize(route))) failures.push(`route not prerendered: ${route}`);
for (const route of pages.filter((item) => item.publicationStatus !== "published").map((item) => item.route)) if (rendered.has(normalize(route))) failures.push(`unpublished route rendered: ${route}`);
for (const route of ["/sitemap.xml", "/robots.txt"]) if (!rendered.has(normalize(route))) failures.push(`metadata route not prerendered: ${route}`);

const robotsBodyPath = join(root, ".next", "server", "app", "robots.txt.body");
const sitemapBodyPath = join(root, ".next", "server", "app", "sitemap.xml.body");
const vercelConfigPath = join(root, "vercel.json");
if (existsSync(vercelConfigPath)) {
  try {
    const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, "utf8"));
    const responseHeaders = (vercelConfig.headers ?? []).flatMap((entry) => entry.headers ?? []);
    const robotsHeaders = responseHeaders.filter((entry) => entry.key?.toLowerCase() === "x-robots-tag").map((entry) => entry.value?.toLowerCase() ?? "").join(",");
    if (siteContract.searchVisibility === "public" && robotsHeaders) failures.push("public build contains an X-Robots-Tag configuration");
    if (siteContract.searchVisibility === "preview" && !/noindex/.test(robotsHeaders)) failures.push("preview X-Robots-Tag configuration lacks noindex");
    if (siteContract.searchVisibility === "preview" && !/nofollow/.test(robotsHeaders)) failures.push("preview X-Robots-Tag configuration lacks nofollow");
    if (siteContract.searchVisibility === "preview" && !/noarchive/.test(robotsHeaders)) failures.push("preview X-Robots-Tag configuration lacks noarchive");
  } catch {
    failures.push("vercel.json is not valid JSON");
  }
}
if (!existsSync(robotsBodyPath) || !existsSync(sitemapBodyPath)) {
  failures.push("metadata route bodies are missing from the production build");
} else {
  const robotsBody = readFileSync(robotsBodyPath, "utf8").toLowerCase();
  const sitemapBody = readFileSync(sitemapBodyPath, "utf8");
  if (siteContract.searchVisibility === "public") {
    if (!/^\s*allow:\s*\/\s*$/im.test(robotsBody) || /^\s*disallow:\s*\/\s*$/im.test(robotsBody)) failures.push("public robots.txt is not crawlable");
    const robotsSitemap = robotsBody.match(/^\s*sitemap:\s*(\S+)\s*$/im)?.[1];
    if (!robotsSitemap) failures.push("public robots.txt lacks a sitemap directive");
    else {
      try {
        if (new URL(robotsSitemap).origin !== siteOrigin) failures.push(`robots sitemap is outside siteUrl origin: ${robotsSitemap}`);
      } catch {
        failures.push(`robots sitemap is invalid: ${robotsSitemap}`);
      }
    }
    let sitemapLocations = 0;
    const expectedSitemapPaths = new Set(expected.map(normalize));
    const sitemapPaths = new Set();
    for (const match of sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
      sitemapLocations += 1;
      try {
        const parsed = new URL(match[1]);
        sitemapPaths.add(normalize(parsed.pathname));
        if (parsed.origin !== siteOrigin) failures.push(`sitemap loc is outside siteUrl origin: ${match[1]}`);
        if (!expectedSitemapPaths.has(normalize(parsed.pathname))) failures.push(`sitemap loc is not a published route: ${match[1]}`);
      } catch {
        failures.push(`sitemap loc is invalid: ${match[1]}`);
      }
    }
    if (sitemapLocations === 0) failures.push("public sitemap has no loc entries");
    for (const route of expectedSitemapPaths) if (!sitemapPaths.has(route)) failures.push(`published route missing from sitemap: ${route}`);
  } else {
    if (!/^\s*disallow:\s*\/\s*$/im.test(robotsBody) || /^\s*allow:\s*\/\s*$/im.test(robotsBody)) failures.push("preview robots.txt does not disallow crawling");
    if (/^\s*sitemap:/im.test(robotsBody)) failures.push("preview robots.txt exposes a sitemap directive");
    if (/<loc>/i.test(sitemapBody)) failures.push("preview sitemap contains public loc entries");
  }
}

const htmlFiles = [];
const htmlRoot = join(root, ".next", "server", "app");
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const current = join(dir, entry);
    if (statSync(current).isDirectory()) walk(current);
    else if (entry.endsWith(".html")) htmlFiles.push(current);
  }
};
walk(htmlRoot);
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (/lorem ipsum|placeholder text|Zero Company|Star Wars Zero Company/i.test(html) || /[A-Z]:\\/.test(html)) failures.push(`forbidden text in ${file}`);
  const publicSourceBlocks = html.match(/<footer[^>]*data-public-sources[^>]*>/g) ?? [];
  if (publicSourceBlocks.length > 1) failures.push(`public sources rendered more than once in ${file}`);
  const publicSourceIndex = html.search(/<footer[^>]*data-public-sources/);
  const relatedPagesIndex = html.indexOf('id="related-pages"');
  if (publicSourceIndex >= 0 && relatedPagesIndex >= 0 && publicSourceIndex < relatedPagesIndex) failures.push(`public sources are not at the page bottom in ${file}`);
  if (siteContract.showImageText === false && /data-image-text/.test(html)) failures.push(`image text rendered while disabled in ${file}`);
  if (/Section sources|Media is labeled with its source record|data-media-attribution/.test(html)) failures.push(`retired media or section source copy rendered in ${file}`);
  if (/_global-error\.html$|_not-found\.html$/.test(file)) continue;
  const attributes = (tag) => Object.fromEntries(
    [...tag.matchAll(/([a-zA-Z_:][a-zA-Z0-9_.:-]*)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1].toLowerCase(), match[2]]),
  );
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const iconTargets = ["/favicon.ico", "/icon-192.png", "/apple-touch-icon.png"];
  for (const target of iconTargets) {
    if (!linkTags.some((tag) => tag.href?.includes(target))) failures.push(`HTML lacks brand icon metadata for ${target} in ${file}`);
  }
  if (!html.includes("data-site-brand-icon")) failures.push(`HTML lacks the configured site brand mark in ${file}`);
  const robotsMeta = metaTags.find((tag) => tag.name?.toLowerCase() === "robots")?.content?.toLowerCase() ?? "";
  if (!robotsMeta) failures.push(`HTML lacks robots metadata in ${file}`);
  if (siteContract.searchVisibility === "public") {
    if (!/index/.test(robotsMeta) || !/follow/.test(robotsMeta) || /noindex|nofollow|noarchive/.test(robotsMeta)) {
      failures.push(`public HTML is not explicitly indexable in ${file}`);
    }
  } else if (!/noindex/.test(robotsMeta) || !/nofollow/.test(robotsMeta) || !/noarchive/.test(robotsMeta)) {
    failures.push(`preview HTML lacks complete blocking robots metadata in ${file}`);
  }
  const canonicalURL = linkTags.find((tag) => tag.rel?.toLowerCase().split(/\s+/).includes("canonical"))?.href;
  const openGraphURL = metaTags.find((tag) => tag.property?.toLowerCase() === "og:url")?.content;
  const alternateURLs = linkTags.filter((tag) => tag.rel?.toLowerCase().split(/\s+/).includes("alternate") && tag.hreflang).map((tag) => tag.href);
  if (!canonicalURL) failures.push(`HTML lacks canonical metadata in ${file}`);
  const canonicalLinks = linkTags.filter((tag) => tag.rel?.toLowerCase().split(/\s+/).includes("canonical"));
  if (canonicalLinks.length !== 1) failures.push(`HTML must have exactly one canonical link in ${file}`);
  {
    const builtPath = file.slice(htmlRoot.length + 1).replaceAll("\\", "/").replace(/\.html$/, "");
    const expectedPath = normalize("/" + (builtPath === "index" ? "" : builtPath));
    if (canonicalURL && expectedBuiltPaths.has(expectedPath)) {
      try {
        const parsed = new URL(canonicalURL);
        if (normalize(parsed.pathname) !== expectedPath || parsed.search || parsed.hash) {
          failures.push(`canonical does not match built route in ${file}: ${canonicalURL}`);
        }
      } catch {
        failures.push(`canonical URL is invalid in ${file}: ${canonicalURL}`);
      }
    }
  }
  if (!openGraphURL) failures.push(`HTML lacks Open Graph URL metadata in ${file}`);
  const metadataUrls = [canonicalURL, openGraphURL, ...alternateURLs].filter(Boolean);
  for (const value of metadataUrls) {
    try {
      if (new URL(value).origin !== siteOrigin) failures.push(`metadata URL is outside siteUrl origin in ${file}: ${value}`);
    } catch {
      failures.push(`metadata URL is invalid in ${file}: ${value}`);
    }
  }
}
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log(`Build check passed: ${expected.length} content routes, sitemap, robots, and ${htmlFiles.length} HTML files checked.`);
