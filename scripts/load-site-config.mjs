import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
export async function loadSiteConfig(root) {
  // Configuration is trusted project code and must remain a self-contained literal.
  const source = readFileSync(new URL('config/site.ts', root), 'utf8');
  const javascript = stripTypeScriptTypes(source);
  return (await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`)).siteConfig;
}
