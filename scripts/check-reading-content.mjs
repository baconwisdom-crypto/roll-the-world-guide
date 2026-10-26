import { readFileSync } from 'node:fs';
const pages=JSON.parse(readFileSync(new URL('../content/pages.json',import.meta.url),'utf8'));
const failures=[];
for(const page of pages){
  for(const section of page.sections){
    if(section.catalog){
      const c=section.catalog;
      if(!c.rows.length||!section.sourceNote?.en) failures.push(`${page.page_id}/${section.id}: catalog needs rows and scope`);
      const names=new Set();
      for(const row of c.rows){
        if(!row.name?.en||names.has(row.name.en)||row.values.length!==c.fields.length||row.values.some(v=>!v.en)) failures.push(`${page.page_id}/${section.id}: incomplete or duplicate catalog record`);
        names.add(row.name?.en);
      }
    }
    for(const step of section.steps??[]){
      for(const field of ['title','prerequisite','action','success','fallback']) if(!step[field]?.en) failures.push(`${page.page_id}/${section.id}: step missing ${field}`);
    }
  }
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('Reading content check passed: catalog names, shared fields, scope notes, and complete conditional steps.');
