const templates = new Set(['landing','hub','catalog','comparison','procedure','troubleshooting']);
export function validate(data, records) {
  const errors = [];
  if (data.version !== 1) errors.push('unsupported structure version');
  for (const key of ['topics','nextTask','onPage','related','pathways','openTopic','chooseTask','browseTopics','catalog','comparison','sourceScope','evidence','faq','image','success','fallback','background','troubleshooting','check','action','guidesCount','recordsCount','sectionsCount','expandBackground']) if (!data.ui?.[key]?.en) errors.push(`missing UI label ${key}`);
  for (const list of [data.groups,data.journeys]) if (new Set(list.map(x=>x.id)).size !== list.length) errors.push('duplicate structure identifier');
  const byId = new Map(records.map(p => [p.page_id,p]));
  const fail = message => errors.push(message);
  const target = (item, owner) => {
    const p = byId.get(item.pageId);
    if (!p || p.publicationStatus !== 'published') return fail(`${owner}: unavailable destination ${item.pageId}`);
    if (item.anchor && !p.sections.some(s => s.id === item.anchor)) fail(`${owner}: missing anchor ${item.anchor}`);
  };
  for (const group of data.groups) {
    target({pageId:group.hubPageId},group.id);
    if (!group.pageIds.length) fail(`${group.id}: empty topic`);
    group.pageIds.forEach(pageId => target({pageId},group.id));
    group.featured.forEach(item => target(item,group.id));
  }
  for (const journey of data.journeys) {
    if (journey.stops.length < 2) fail(`${journey.id}: incomplete journey`);
    journey.stops.forEach(item => target(item,journey.id));
  }
  for (const [id,layout] of Object.entries(data.pages)) {
    const page = byId.get(id);
    if (!page || page.publicationStatus !== 'published') { fail(`${id}: unavailable page`); continue; }
    if (!templates.has(layout.template)) fail(`${id}: unknown template`);
    if (new Set(layout.focusSectionIds).size !== layout.focusSectionIds.length) fail(`${id}: duplicate focus section`);
    for (const sid of layout.focusSectionIds) if (!page.sections.some(s => s.id === sid)) fail(`${id}: missing section ${sid}`);
    layout.groupIds.forEach(gid => { if (!data.groups.some(g => g.id === gid)) fail(`${id}: missing group ${gid}`); });
    layout.journeyIds.forEach(jid => { if (!data.journeys.some(j => j.id === jid)) fail(`${id}: missing journey ${jid}`); });
    layout.destinations.forEach(item => target(item,id));
    if (['catalog','comparison','troubleshooting'].includes(layout.template) && !layout.scopeNote?.en) fail(`${id}: missing evidence scope`);
    if (layout.template === 'catalog' && (!layout.focusSectionIds.includes(layout.catalogSectionId) || !page.sections.find(s => s.id === layout.catalogSectionId)?.catalog?.rows.length)) fail(`${id}: empty catalog`);
    if (layout.template === 'comparison' && (!layout.focusSectionIds.includes(layout.comparisonSectionId) || !page.sections.find(s => s.id === layout.comparisonSectionId)?.table?.rows.length)) fail(`${id}: empty comparison`);
    if (layout.template === 'procedure') {
      const stages = layout.procedure?.stages ?? [];
      if (!stages.length || new Set(stages.map(s => s.sectionId)).size !== stages.length || stages.length !== layout.focusSectionIds.length) fail(`${id}: incomplete procedure`);
      for (const stage of stages) if (!layout.focusSectionIds.includes(stage.sectionId) || ['action','success','fallback'].some(k => !stage[k]?.en)) fail(`${id}: incomplete checkpoint`);
    }
    if (layout.template === 'troubleshooting') {
      const issueIds = (layout.issues ?? []).map(i=>i.id);
      if (new Set(issueIds).size !== issueIds.length || issueIds.some(sid=>page.sections.some(s=>s.id===sid))) fail(`${id}: duplicate issue anchor`);
      if (!layout.issues?.length) fail(`${id}: no issues`);
      for (const issue of layout.issues ?? []) {
        if (!layout.focusSectionIds.includes(issue.sectionId) || ['symptom','check','action','outcome','sourceNote'].some(k => !issue[k]?.en)) fail(`${id}: incomplete issue`);
        if (issue.next) target(issue.next,id);
      }
    }
  }
  return errors;
}
