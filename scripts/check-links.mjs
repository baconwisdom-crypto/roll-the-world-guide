import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePrimaryActionContract } from "./framework-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = JSON.parse(readFileSync(join(root, "content", "pages.json"), "utf8"));
const knownPages = new Map(pages.map((page) => [page.page_id, page]));
const knownRoutes = new Set(pages.filter((page) => page.publicationStatus === "published").map((page) => page.route));
const normalize = (route) => route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}/`;
const publishedRoutes = new Set([...knownRoutes].map(normalize));
const failures = [];
for (const page of pages) {
  for (const message of validatePrimaryActionContract(page, { pageMap: knownPages, publishedRoutes })) failures.push(message);
  for (const related of page.relatedPageIds ?? []) if (!knownPages.has(related)) failures.push(`${page.page_id}: related page ${related}`);
  for (const section of page.sections ?? []) {
    for (const card of section.cards ?? []) {
      if (card.pageId && !knownPages.has(card.pageId)) failures.push(`${page.page_id}: card page ${card.pageId}`);
      if (card.href && card.href.startsWith("/") && !knownRoutes.has(normalize(card.href))) failures.push(`${page.page_id}: card href ${card.href}`);
    }
  }
  for (const image of page.images ?? []) {
    if (image.sourceUrl && !/^https:\/\//.test(image.sourceUrl)) failures.push(page.page_id + ": image source URL " + image.sourceUrl);
    if (image.sourceArticleUrl && !/^https:\/\//.test(image.sourceArticleUrl)) failures.push(page.page_id + ": image article source URL " + image.sourceArticleUrl);
  }
}
if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log(`Link check passed: ${pages.length} page records and all internal page references resolve.`);
