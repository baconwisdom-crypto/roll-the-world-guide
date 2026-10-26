import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { loadSiteConfig } from './load-site-config.mjs';
const root = new URL('../', import.meta.url);
const config = await loadSiteConfig(root);
const pages = JSON.parse(readFileSync(new URL('content/pages.json',root),'utf8'));
const entries = pages.filter(p => p.publicationStatus === 'published').flatMap(page => page.localeAvailability.filter(l => config.publishedLocales.includes(l)).map(l => ({page, route:`${l === 'en' ? '' : '/' + l}${page.route}`})));
const expected = entries.map(e=>e.route);
for (const route of expected) assert.ok(existsSync(new URL(`out/${route.slice(1)}index.html`,root)), `Missing static HTML: ${route}`);
for (const file of ['robots.txt','sitemap.xml','404.html','deployment.json']) assert.ok(existsSync(new URL('out/'+file,root)), `Missing export: ${file}`);
const marker = JSON.parse(readFileSync(new URL('out/deployment.json',root),'utf8'));
assert.equal(marker.site, config.siteSlug);
if (process.env.CF_PAGES_COMMIT_SHA) assert.equal(marker.commit,process.env.CF_PAGES_COMMIT_SHA);
const actual=[];
function walk(url,prefix='') { for (const entry of readdirSync(url,{withFileTypes:true})) { if (entry.isDirectory() && entry.name !== '_next') walk(new URL(entry.name+'/',url),prefix+entry.name+'/'); else if (entry.name==='index.html') actual.push('/'+prefix); } }
walk(new URL('out/',root));
assert.deepEqual(actual.filter(p => !['/404/','/_not-found/'].includes(p)).sort(),expected.sort(),'Export must contain exactly the published locale routes plus Next error pages');
for (const {route,page} of entries) {
 const html=readFileSync(new URL(`out/${route.slice(1)}index.html`,root),'utf8');
 if (config.searchVisibility==='public') assert.ok(!html.includes('data-ad-state="preview"'),'Public HTML must not contain preview ads');
 const expectsRail = config.ads.desktopChrome?.enabled && config.ads.placements?.['left-sticky'] && config.ads.previewPlaceholders && !config.ads.enabled;
 const railPresent=html.includes('data-ad-placement="left-sticky"');
 if (!config.ads.enabled) assert.equal(railPresent,Boolean(expectsRail),'Rendered preview rail must match configuration');
 if (!config.ads.desktopChrome?.enabled || !config.ads.placements?.['left-sticky']) assert.equal(railPresent,false,'Disabled rail must not render');
 if (config.heroImage || page.images?.length) {
  assert.match(html, /property="og:image" content="https:\/\//);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
 }
}
console.log(`Static export verified: ${expected.length} exact routes, metadata, marker and configured preview rail.`);
