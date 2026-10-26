import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readSiteConfigContract, validateSiteConfigContract } from "./framework-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");
const required = [
  ["lib/seo.ts", "alternates"],
  ["lib/seo.ts", "localeOpenGraphTags"],
  ["lib/seo.ts", "robots"],
  ["lib/seo.ts", "searchVisibility"],
  ["lib/seo.ts", "BRAND_ICON_METADATA"],
  ["lib/seo.ts", "icons:"],
  ["lib/brand-icons.ts", "BRAND_ICON_OUTPUTS"],
  ["lib/types.ts", "SearchVisibility"],
  ["config/site.ts", "searchVisibility"],
  ["config/site.ts", "brandIcon"],
  ["config/site.ts", "navigationIcons"],
  ["components/site-header.tsx", "SiteBrandMark"],
  ["components/site-header.tsx", "site-header-brand-row"],
  ["components/site-header.tsx", "site-header-navigation-row"],
  ["app/(en)/layout.tsx", "page-content"],
  ["app/[locale]/layout.tsx", "page-content"],
  ["app/globals.css", "--ui-page-content-padding"],
  ["components/content-image.tsx", "ARTICLE_MEDIA_SIZES"],
  ["components/guide-article.tsx", "data-media-layout=\"video-stack\""],
  ["components/guide-article.tsx", "compact-square"],
  ["app/sitemap.ts", "publishedPages"],
  ["app/sitemap.ts", "searchVisibility"],
  ["app/robots.ts", "sitemap"],
  ["app/robots.ts", "disallow"],
  ["scripts/check-build.mjs", "X-Robots-Tag"],
  ["components/locale-switcher.tsx", "localizedHref"],
];
const failures = [];
for (const [file, marker] of required) if (!read(file).includes(marker)) failures.push(`${file} is missing ${marker}`);
for (const message of validateSiteConfigContract(readSiteConfigContract(join(root, "config", "site.ts")))) failures.push(message);
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("SEO contract check passed: canonical, hreflang, Open Graph locale, sitemap, robots, and locale links are wired.");
