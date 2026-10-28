import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const bundle = JSON.parse(readFileSync("config/ad-units.json", "utf8"));
assert.equal(bundle.domain, "rolltheworldwiki.wiki");
assert.equal(bundle.websiteId, 6157049);
assert.equal(bundle.category, "Social");
assert.equal(bundle.complete, true);
assert.deepEqual(bundle.units.map(unit => unit.format).sort(), ["native", "300x250", "728x90", "320x50", "160x600"].sort());
assert.equal(new Set(bundle.units.map(unit => unit.key)).size, 5);
for (const unit of bundle.units) {
  assert.match(unit.key, /^[a-f0-9]{32}$/);
  assert.ok(unit.raw.includes(unit.key));
  for (const url of unit.scriptUrls) { assert.ok(unit.raw.includes(url)); assert.equal(new URL(url).protocol, "https:"); }
  if (unit.format !== "native") {
    assert.equal(`${unit.width}x${unit.height}`, unit.format);
    assert.match(unit.raw, new RegExp(`'width'\\s*:\\s*${unit.width}\\b`));
    assert.match(unit.raw, new RegExp(`'height'\\s*:\\s*${unit.height}\\b`));
  }
  console.log(`${unit.format}: placement ${unit.placementId}, raw sha256 ${createHash("sha256").update(unit.raw).digest("hex")}`);
}
const html = readFileSync("out/index.html", "utf8");
for (const placement of ["left-sticky", "home-banner", "article-banner", "sidebar-square"]) assert.ok(html.includes(`data-ad-placement="${placement}"`));
assert.ok(html.includes("has-left-ad"));
assert.ok(html.includes("Roll the World Wiki: Codes, Stars &amp; Upgrades"));
assert.ok(readFileSync("out/sources/index.html", "utf8").includes("third-party ads supplied by Adsterra"));
console.log("Ad integration contract passed: exact domain, five original units, production mounts, title and privacy disclosure.");
