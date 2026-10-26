import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const pages = read('content/pages.json');
const structure = read('content/structure.json');
import { validate } from './architecture-contract.mjs';
const fixtureStructure = read('scripts/fixtures/architecture-structure.json');
const fixturePages = read('scripts/fixtures/architecture-pages.json');
const failures = validate(structure,pages);
for (const mutate of [
  d => d.groups[0].hubPageId = 'missing-page',
  d => d.journeys[0].stops[0].anchor = 'missing-anchor',
  d => Object.values(d.pages)[0].template = 'unknown',
  d => { const p=Object.values(d.pages).find(p=>p.template==='catalog'); p.catalogSectionId='missing-catalog'; },
  d => { const p=Object.values(d.pages).find(p=>p.template==='procedure'); p.procedure.stages[0].success={}; },
]) {
  const invalid=structuredClone(fixtureStructure); mutate(invalid);
  assert.ok(validate(invalid,fixturePages).length,'Invalid structure must fail acceptance');
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Architecture passed: ${Object.keys(structure.pages).length} pages, ${structure.groups.length} groups, ${structure.journeys.length} journeys; 5 invalid fixtures rejected.`);
