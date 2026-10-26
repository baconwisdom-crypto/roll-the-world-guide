import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { ContentImage } from "./content-image";
import { ReferenceCatalog } from "./reference-catalog";
import { SectionView, TableView, MediaFigure } from "./page-sections";
import { SourceList } from "./source-list";
import { SupportingGuidance } from "./supporting-guidance";
import { HeroMedia } from "./hero-media";
import { AdSlot } from "./ad-slot";
import { RollWorldHomepage } from "./roll-world-homepage";
import { siteConfig } from "@/config/site";
import { structure, destinationHref } from "@/lib/architecture";
import { pageById, pageIsAvailable, text } from "@/lib/content";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";
import type { PageRecord, PageSection } from "@/lib/types";
import type { PageStructure, TaskDestination, PageTemplate } from "@/lib/architecture-types";

type Props = { page: PageRecord; layout: PageStructure; locale: Locale };
const label = (key: string, locale: Locale) => text(structure.ui[key], locale);
const getSection = (page: PageRecord, id: string) => page.sections.find(section => section.id === id)!;

function Destination({ item, locale, children, className }: { item: TaskDestination; locale: Locale; children?: ReactNode; className?: string }) {
  const href = destinationHref(item, locale);
  if (!href) return null;
  return <Link className={className ?? "arch-destination"} href={href}>{children ?? <><strong>{text(item.label, locale)}</strong><span>{text(item.description, locale)}</span><span className="arch-arrow" aria-hidden="true">↗</span></>}</Link>;
}

function Answer({ page, locale }: Pick<Props, "page" | "locale">) {
  const primary = page.primaryAction;
  const primaryPage = primary?.pageId ? pageById(primary.pageId) : undefined;
  const href = primaryPage && pageIsAvailable(primaryPage, locale) ? localizedHref(locale, primaryPage.route) : primary?.href ? localizedHref(locale, primary.href) : undefined;
  return <div className="arch-answer" data-quick-answer>
    <p className="arch-kicker">{text(page.quickAnswer.title, locale)}</p>
    <p>{text(page.quickAnswer.body, locale)}</p>
    {primary && href && <Link className="arch-primary" href={href}>{text(primary.label, locale)} <span aria-hidden="true">→</span></Link>}
  </div>;
}

function Heading({ page, layout, locale }: Props) {
  return <header className="arch-heading"><p className="arch-kicker">{text(page.pageStatus, locale)}</p><h1>{text(layout.displayTitle ?? page.title, locale)}</h1><p className="arch-deck">{text(layout.deck ?? page.intro, locale)}</p></header>;
}

function Section({ page, section, locale }: { page: PageRecord; section: PageSection; locale: Locale }) {
  const images = page.images.filter(image => section.imageIds?.includes(image.id ?? image.src));
  return <SectionView section={section} images={images} locale={locale} />;
}

function TopicGroups({ layout, locale, compact = false }: Pick<Props, "layout" | "locale"> & { compact?: boolean }) {
  return <div className={compact ? "arch-topic-grid" : "arch-topic-directory"}>{layout.groupIds.map(id => {
    const group = structure.groups.find(candidate => candidate.id === id)!;
    const pages = group.pageIds.map(pageById).filter((page): page is PageRecord => Boolean(page && pageIsAvailable(page, locale)));
    return <section key={id} className="arch-topic-group" aria-labelledby={`topic-${id}`}>
      <div className="arch-topic-intro"><p className="arch-kicker">{String(pages.length).padStart(2, "0")} {label("guidesCount", locale)}</p><h3 id={`topic-${id}`}>{text(group.title, locale)}</h3><p>{text(group.summary, locale)}</p></div>
      {compact ? <ul className="arch-link-list">{group.featured.map(item => <li key={item.pageId}><Destination item={item} locale={locale} className="arch-small-link"><strong>{text(item.label, locale)}</strong><span>{text(item.description, locale)}</span></Destination></li>)}</ul>
        : <ul className="arch-guide-index">{pages.map(page => <li key={page.page_id}><Link href={localizedHref(locale, page.route)}><strong>{text(page.title, locale)}</strong><span>{text(page.description, locale)}</span></Link></li>)}</ul>}
    </section>;
  })}</div>;
}

function ContextRail({ page, layout, locale }: Props) {
  return <aside className="arch-context" aria-label={label("nextTask", locale)}>
    {layout.template !== "troubleshooting" && layout.destinations.length > 0 && <section><p className="arch-kicker">{label("nextTask", locale)}</p><div className="arch-next-list">{layout.destinations.slice(0, 3).map((item, i) => <Destination key={i} item={item} locale={locale} />)}</div></section>}
    <nav aria-label={label("onPage", locale)}><p className="arch-kicker">{label("onPage", locale)}</p><ol>{layout.focusSectionIds.map((id, index) => <li key={id}><a href={`#${id}`}><span>{String(index + 1).padStart(2, "0")}</span>{text(getSection(page, id).title, locale)}</a></li>)}{page.sections.some(section => !layout.focusSectionIds.includes(section.id)) && <li><a href="#supporting-guidance">{text(layout.supportTitle, locale)}</a></li>}<li><a href="#source-scope">{label("sourceScope", locale)}</a></li></ol></nav>
  </aside>;
}

function ArticleAd({ page }: Pick<Props, "page">) {
  if (page.pageType === "Source" || page.pageType === "Hub") return null;
  return <AdSlot placement="article-banner" format="responsive-banner" />;
}

function ArticleSections({ page, locale, sectionIds }: Pick<Props, "page" | "locale"> & { sectionIds: string[] }) {
  if (!sectionIds.length) return <ArticleAd page={page} />;
  const adAfter = Math.max(1, Math.ceil(sectionIds.length / 2));
  return <>{sectionIds.map((id, index) => <Fragment key={id}><Section page={page} section={getSection(page, id)} locale={locale} />{index + 1 === adAfter && <ArticleAd page={page} />}</Fragment>)}</>;
}

function ReadingFrame({ props, children }: { props: Props; children: ReactNode }) {
  return <div className="arch-reading-grid"><div className="arch-main">{children}</div><ContextRail {...props} /></div>;
}

function Support({ page, layout, locale }: Props) {
  const used = new Set(layout.focusSectionIds);
  const remainder = page.sections.filter(section => !used.has(section.id));
  if (!remainder.length) return null;
  return <SupportingGuidance expandLabel={label("expandBackground", locale)} countLabel={label("sectionsCount", locale)} title={text(layout.supportTitle, locale)} entries={remainder.map(section => ({ id: section.id, title: text(section.title, locale) }))}>
    {remainder.map(section => <Section key={section.id} page={page} section={section} locale={locale} />)}
  </SupportingGuidance>;
}

function EndMatter(props: Props) {
  const { page, layout, locale } = props;
  const placed = new Set(page.sections.flatMap(section => section.imageIds ?? []));
  const unplaced = page.images.filter(image => !placed.has(image.id ?? image.src) && !(page.pageType === "Home" && layout.template === "landing" && image.src === siteConfig.heroImage?.src));
  return <>
    <Support {...props} />
    {unplaced.length > 0 && <div className="arch-unplaced-media">{unplaced.map(image => <MediaFigure key={image.id ?? image.src} image={image} locale={locale} />)}</div>}
    {page.faq?.length ? <section className="arch-faq" aria-labelledby="faq"><h2 id="faq">{label("faq", locale)}</h2>{page.faq.map((item, index) => <details key={index}><summary>{text(item.question, locale)}</summary><p>{text(item.answer, locale)}</p></details>)}</section> : null}
    <section id="source-scope" className="arch-evidence" aria-labelledby="source-heading"><h2 id="source-heading">{label("evidence", locale)}</h2><p>{text(layout.scopeNote ?? page.answerSourceNote ?? page.boundary.title, locale)}</p><ul>{page.boundary.items.map((item, i) => <li key={i}>{text(item, locale)}</li>)}</ul><SourceList sourceIds={page.sourceIds} locale={locale} heading="Official sources" /></section>
  </>;
}

function LandingTemplate(props: Props) {
  const { page, layout, locale } = props;
  if (page.page_id === "home" && locale === "en") return <><RollWorldHomepage /><EndMatter {...props} /></>;
  const image = siteConfig.heroImage;
  const video = siteConfig.heroVideo;
  return <><div className="arch-landing-lead"><div><Heading {...props} /><Answer page={page} locale={locale} /></div>{image && <div className="arch-brand-image"><ContentImage bare preload image={{ src: image.src, alt: text(image.alt, locale), ratio: image.ratio, fit: image.fit }} /></div>}{video && <div className="arch-brand-image"><HeroMedia video={video} /></div>}</div>
    <AdSlot placement="home-banner" format="responsive-banner" />
    <section className="arch-landing-tasks" aria-labelledby="choose-task"><h2 id="choose-task">{label("chooseTask", locale)}</h2><nav className="arch-task-grid" aria-label={label("chooseTask", locale)}>{layout.destinations.map(item => <Destination key={item.pageId} item={item} locale={locale} />)}</nav></section>
    <section aria-labelledby="browse-topics"><h2 id="browse-topics">{label("browseTopics", locale)}</h2><TopicGroups layout={layout} locale={locale} compact /></section>
    <EndMatter {...props} /></>;
}

function HubTemplate(props: Props) {
  return <><Heading {...props} /><section aria-labelledby="browse-topics"><h2 id="browse-topics">{label("browseTopics", props.locale)}</h2><TopicGroups layout={props.layout} locale={props.locale} /></section><Answer page={props.page} locale={props.locale} /><EndMatter {...props} /></>;
}

function CatalogTemplate(props: Props) {
  const { page, layout, locale } = props;
  const catalogSection = getSection(page, layout.catalogSectionId!);
  const referenceImages = page.images.filter(image => catalogSection.imageIds?.includes(image.id ?? image.src));
  return <><Heading {...props} /><ReadingFrame props={props}><section className="arch-catalog-core" aria-labelledby={catalogSection.id}><div className="arch-module-heading"><h2 id={catalogSection.id}>{label("catalog", locale)}</h2><span>{catalogSection.catalog!.rows.length} {label("recordsCount", locale)}</span></div><p className="arch-scope">{text(layout.scopeNote!, locale)}</p><ReferenceCatalog catalog={catalogSection.catalog!} locale={locale} /></section>
    <section className="arch-image-reference" aria-labelledby="official-reference-images"><h2 id="official-reference-images">{label("image", locale)}</h2><div className="arch-section-stack">{catalogSection.sourceNote && <p>{text(catalogSection.sourceNote, locale)}</p>}{catalogSection.summary && <p>{text(catalogSection.summary, locale)}</p>}{catalogSection.paragraphs?.map((p, i) => <p key={i}>{text(p, locale)}</p>)}{referenceImages.map(image => <Fragment key={image.id ?? image.src}><MediaFigure image={image} locale={locale} /><a className="arch-text-link" href={image.src}>{text(image.alt, locale)} ↗</a></Fragment>)}</div></section>
    <Answer page={page} locale={locale} /><ArticleSections page={page} locale={locale} sectionIds={layout.focusSectionIds.filter(id => id !== layout.catalogSectionId)} /><EndMatter {...props} /></ReadingFrame></>;
}

function ComparisonTemplate(props: Props) {
  const { page, layout, locale } = props;
  const comparison = getSection(page, layout.comparisonSectionId!);
  return <><Heading {...props} /><ReadingFrame props={props}><Answer page={page} locale={locale} /><section className="arch-comparison-core" aria-labelledby={comparison.id}><h2 id={comparison.id}>{label("comparison", locale)}</h2><p className="arch-scope">{text(layout.scopeNote!, locale)}</p><TableView table={comparison.table!} locale={locale} /><div className="arch-example-note">{comparison.paragraphs?.map((p, i) => <p key={i}>{text(p, locale)}</p>)}</div></section><ArticleSections page={page} locale={locale} sectionIds={layout.focusSectionIds.filter(id => id !== layout.comparisonSectionId)} /><EndMatter {...props} /></ReadingFrame></>;
}

function ProcedureTemplate(props: Props) {
  const { page, layout, locale } = props;
  const procedure = layout.procedure!;
  return <><Heading {...props} /><ReadingFrame props={props}><Answer page={page} locale={locale} /><section className="arch-procedure-core" aria-labelledby="procedure-heading"><h2 id="procedure-heading">{text(procedure.title, locale)}</h2><p className="arch-scope">{text(procedure.scope, locale)}</p><ol className="arch-stage-list">{procedure.stages.map((stage, index) => {
    const section = getSection(page, stage.sectionId);
    return <li key={stage.sectionId}><div className="arch-stage-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div><div><h3 id={stage.sectionId}>{text(section.title, locale)}</h3><p className="arch-stage-action">{text(stage.action, locale)}</p><dl className="arch-check-pair"><div><dt>{label("success", locale)}</dt><dd>{text(stage.success, locale)}</dd></div><div><dt>{label("fallback", locale)}</dt><dd>{text(stage.fallback, locale)}</dd></div></dl><div className="arch-stage-evidence" aria-label={label("background", locale)}><p className="arch-kicker">{label("background", locale)}</p><Section page={page} section={{ ...section, id: `${section.id}-detail` }} locale={locale} /></div></div></li>;
  })}</ol></section><ArticleAd page={page} /><EndMatter {...props} /></ReadingFrame></>;
}

function TroubleshootingTemplate(props: Props) {
  const { page, layout, locale } = props;
  return <><Heading {...props} /><ReadingFrame props={props}><section className="arch-issues" aria-labelledby="issue-heading"><h2 id="issue-heading">{label("troubleshooting", locale)}</h2><p className="arch-scope">{text(layout.scopeNote!, locale)}</p>{layout.issues!.map(issue => <details key={issue.id} className="arch-issue" id={issue.id}><summary>{text(issue.symptom, locale)}</summary><dl><div><dt>{label("check", locale)}</dt><dd>{text(issue.check, locale)}</dd></div><div><dt>{label("action", locale)}</dt><dd>{text(issue.action, locale)}</dd></div><div><dt>{label("success", locale)}</dt><dd>{text(issue.outcome, locale)}</dd></div></dl><p className="arch-scope">{text(issue.sourceNote, locale)}</p><a className="arch-text-link" href={`#${issue.sectionId}`}>{label("background", locale)} →</a>{issue.next && <Destination item={issue.next} locale={locale} />}</details>)}</section><Answer page={page} locale={locale} /><ArticleAd page={page} />{layout.focusSectionIds.map(id => <Section key={id} page={page} section={getSection(page, id)} locale={locale} />)}<EndMatter {...props} /></ReadingFrame></>;
}

const templates: Record<PageTemplate, (props: Props) => ReactNode> = {
  landing: LandingTemplate,
  hub: HubTemplate,
  catalog: CatalogTemplate,
  comparison: ComparisonTemplate,
  procedure: ProcedureTemplate,
  troubleshooting: TroubleshootingTemplate,
};

/** Each template composes existing facts and typed structure; game identity stays in data. */
export function StructuredPage(props: Props) {
  const Template = templates[props.layout.template];
  return <article className={`arch-page arch-${props.layout.template}`} data-page-id={props.page.page_id} data-page-type={props.page.pageType} data-template={props.layout.template}>
    {props.layout.template !== "landing" && <Breadcrumbs route={props.page.route} locale={props.locale} />}
    <Template {...props} />
  </article>;
}
