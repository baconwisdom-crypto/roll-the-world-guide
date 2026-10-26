import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadSiteConfig } from './load-site-config.mjs';
const root = new URL('../', import.meta.url);
const config = await loadSiteConfig(root);
let commit = process.env.CF_PAGES_COMMIT_SHA;
if (!commit) {
  try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fileURLToPath(root), encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim(); }
  catch { commit = 'local-preview'; }
}
writeFileSync(new URL('public/deployment.json', root), JSON.stringify({ commit, site: config.siteSlug, builtAt: new Date().toISOString() }) + '\n');
