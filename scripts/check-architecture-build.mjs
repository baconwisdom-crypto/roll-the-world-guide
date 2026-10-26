import { readSiteConfigContract } from "./framework-contract.mjs";
import { readFileSync } from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const config=readSiteConfigContract(new URL("config/site.ts",root));
const pages=JSON.parse(read('content/pages.json'));
const structure=JSON.parse(read('content/structure.json'));
const failures=[];
let checked=0;
for (const page of pages.filter(p=>p.publicationStatus==='published')) {
  const layout=structure.pages[page.page_id];
  if (!layout) continue;
  for (const locale of page.localeAvailability.filter(locale=>config.publishedLocales.includes(locale))) {
    const route=(locale==='en'?'':`/${locale}`)+(page.route==='/'?'':page.route.replace(/\/$/,''));
    const html=read(`.next/server/app/${route.slice(1)||'index'}.html`).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
    // Disabled templates legitimately fall back to the classic article renderer.
    if (!html.includes('data-template=')) continue;
    checked++;
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    if (!html.includes(`data-template="${layout.template}"`)) failures.push(`${route}: wrong template`);
    if ((html.match(/<h1\b/g)??[]).length!==1) failures.push(`${route}: requires one H1`);
    if (ids.length!==new Set(ids).size) failures.push(`${route}: duplicate IDs`);
    for (const section of page.sections) if (!ids.includes(section.id)) failures.push(`${route}: missing section ${section.id}`);
    for (const anchor of html.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(anchor[1])) failures.push(`${route}: missing anchor ${anchor[1]}`);
    const backgroundCount=page.sections.filter(s=>!layout.focusSectionIds.includes(s.id)).length;
    if (backgroundCount && !html.includes('class="arch-support-index"')) failures.push(`${route}: background outline missing`);
  }
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Architecture build passed: ${checked} localized structured pages, original anchors and visible background indexes.`);
