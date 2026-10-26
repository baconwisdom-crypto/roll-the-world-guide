import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readSiteConfigContract,
  validateBrandIconAssetContract,
  validateBrandIconConfigContract,
} from "./framework-contract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = readSiteConfigContract(join(root, "config", "site.ts"));
const sources = JSON.parse(readFileSync(join(root, "content", "sources.json"), "utf8"));
const sourceMap = new Map(sources.map((source) => [source.id, source]));
const failures = [
  ...validateBrandIconConfigContract(config, { sourceMap, root }),
  ...validateBrandIconAssetContract(config, { root }),
];

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log("Brand icon check passed: official source, square input, favicon.ico, icon-192.png, and apple-touch-icon.png are valid.");
