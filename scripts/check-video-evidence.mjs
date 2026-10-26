import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pages = JSON.parse(readFileSync(join(root, "content", "pages.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(root, "content", "sources.json"), "utf8"));
const sourceIds = new Set(sources.map((source) => source.id));
const bindingPath = join(root, "research", "video", "derived", "text-image-bindings.md");
const manifestPath = join(root, "content", "video-evidence.json");
const failures = [];
const videoImages = [];

for (const page of pages) {
  for (const image of page.images ?? []) {
    if (!image.src?.includes("/video-") && !image.sourceId?.startsWith("video-")) continue;
    videoImages.push({ page, image });
  }
}

const bindings = existsSync(bindingPath) ? readFileSync(bindingPath, "utf8") : "";
let manifest = [];
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!Array.isArray(manifest)) throw new Error("Expected an array");
  } catch (error) {
    failures.push(`Invalid content/video-evidence.json: ${error.message}`);
    manifest = [];
  }
}
if (videoImages.length > 0 && !existsSync(manifestPath)) {
  failures.push("Video-derived page images require tracked content/video-evidence.json for clean CI builds");
}

for (const { page, image } of videoImages) {
  const label = `${page.page_id}:${image.id ?? image.src}`;
  const caption = image.caption?.en ?? "";
  const time = caption.match(/\b\d{2}:\d{2}:\d{2}\b/)?.[0];
  const assetPath = join(root, "public", image.src.replace(/^\//, ""));

  if (!sourceIds.has(image.sourceId)) failures.push(`${label} references unknown sourceId ${image.sourceId}`);
  if (!/youtube\.com\/watch\?v=.+[?&]t=\d+s/.test(image.sourceUrl ?? "")) failures.push(`${label} requires a timestamped YouTube sourceUrl`);
  if (!time) failures.push(`${label} caption requires an HH:MM:SS source timestamp`);
  if (!existsSync(assetPath)) failures.push(`${label} asset is missing at ${image.src}`);
  const row = manifest.find((entry) => entry.asset === image.src && entry.shot_ids?.includes(image.id));
  const section = page.sections.find((entry) => entry.imageIds?.includes(image.id));
  if (!row) failures.push(`${label} is missing from content/video-evidence.json`);
  else {
    if (row.sourceId !== image.sourceId || row.sourceUrl !== image.sourceUrl || row.timecode !== time) failures.push(`${label} source or timestamp does not match tracked evidence`);
    if (!section || row.text_block_id !== `${page.page_id}.${section.id}`) failures.push(`${label} text_block_id does not match its actual section`);
    if (!Array.isArray(row.fact_ids) || row.fact_ids.length === 0 || row.fact_ids.some((id) => typeof id !== "string" || !id.trim())) failures.push(`${label} requires stable fact_ids`);
  }
  if (bindings) {
    if (!bindings.includes(image.src)) failures.push(`${label} is missing from local text-image-bindings.md`);
    if (image.sourceId && !bindings.includes(image.sourceId)) failures.push(`${label} local binding does not name sourceId ${image.sourceId}`);
    if (time && !bindings.includes(time)) failures.push(`${label} local binding does not preserve timestamp ${time}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Video evidence check passed for ${videoImages.length} image(s).`);
