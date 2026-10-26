import { copyFileSync, statSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// Creates a new, independent checkout. Existing destinations are never overwritten.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const destination = args[0] ? resolve(args[0]) : undefined;
if (!destination || destination === root || destination.startsWith(root + '/') || destination.startsWith(root + '\\')) throw new Error('Pass an absolute destination outside the framework directory.');
if (existsSync(destination)) throw new Error('Destination already exists; choose a new directory.');
const ignored = new Set(['node_modules','.next','.git','.vercel','validation','BASELINE-PROVENANCE.json','preview-process.json','out','build','research','.wrangler','secrets','backups','wrangler.toml','wrangler.json','wrangler.jsonc','google_oauth_client.json','google_token.json']);
function copyTree(source, target) {
  const name = basename(source);
  if (ignored.has(name) || name.startsWith('.env') || name.startsWith('.dev.vars') || /\.log$|\.tsbuildinfo$|\.pem$|\.key$/.test(name)) return;
  if (name === 'deployment.json' && basename(dirname(source)) === 'public') return;
  if (source === join(root, 'app', '[locale]', '[[...path]]', 'page.tsx')) return;
  if (statSync(source).isDirectory()) {
    mkdirSync(target, {recursive:true});
    for (const entry of readdirSync(source)) copyTree(join(source,entry),join(target,entry));
  } else copyFileSync(source,target);
}
mkdirSync(destination, { recursive: true });
for (const entry of readdirSync(root)) {
  if (ignored.has(entry) || entry.startsWith('.env') || /\.log$|\.tsbuildinfo$/.test(entry)) continue;
  copyTree(join(root,entry),join(destination,entry));
}
if (args.includes('--demo-variant')) {
  const contentPath=join(destination,'content');
  const pages=JSON.parse(readFileSync(join(contentPath,'pages.json'),'utf8'));
  const structure=JSON.parse(readFileSync(join(contentPath,'structure.json'),'utf8'));
  const ids=new Map(pages.map(p=>[p.page_id,`demo-${p.page_id}`]));
  const routeMap=new Map(pages.map(p=>[p.route,p.route==='/'?'/':`/handbook${p.route}`]));
  const rewrite=(value,key)=> {
    if (Array.isArray(value)) return value.map(v=>rewrite(v,key));
    if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewrite(v,k)]));
    if (typeof value==='string') {
      if (['page_id','pageId','hubPageId','pageIds','relatedPageIds','parentPageId'].includes(key)) return ids.get(value)??value;
      if (['route','href'].includes(key)) return routeMap.get(value)??value;
    }
    return value;
  };
  const changedPages=rewrite(pages);
  const changedStructure=rewrite(structure);
  changedStructure.pages=Object.fromEntries(Object.entries(changedStructure.pages).map(([id,value])=>[ids.get(id),value]));
  for (const [name,data] of [['pages',changedPages],['structure',changedStructure],['routes',changedPages.filter(p=>p.publicationStatus==='published').map(p=>({route:p.route,locales:p.localeAvailability}))]]) writeFileSync(join(contentPath,`${name}.json`),JSON.stringify(data,null,2)+'\n');
  const configPath=join(destination,'config/site.ts');
  let config=readFileSync(configPath,'utf8').replace('siteName: "Game Guide Framework V2"','siteName: "Atlas Demo Handbook"').replace('https://game-guide-framework.example','https://atlas-demo.example').replace('siteSlug: "game-guide-framework-v2"','siteSlug: "atlas-demo"').replace('#c8ff4d','#64d5e8').replace('#d9ff8a','#b3eef6');
  for (const [id,replacement] of ids) config=config.replaceAll(`"${id}":`, `"${replacement}":`).replaceAll(`    ${id}:`, `    "${replacement}":`);
  writeFileSync(configPath,config);
}
console.log(`Created ${basename(destination)} at ${destination}. Replace configuration, content and approved media, then run npm ci and npm run verify. Preview visibility remains enabled.`);
