import Link from "next/link";
import { Fragment } from "react";
import { ActionCard } from "@/components/action-card";
import { AdSlot } from "@/components/ad-slot";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  ARTICLE_MEDIA_SIZES,
  COMPACT_MEDIA_SIZES,
  ContentImage,
  HERO_COMPACT_MEDIA_SIZES,
  HERO_MEDIA_SIZES,
} from "@/components/content-image";
import { HeroMedia } from "@/components/hero-media";
import { NoticePanel } from "@/components/notice-panel";
import { PageHeader } from "@/components/page-header";
import { PageWithToc } from "@/components/page-with-toc";
import { SectionHeading } from "@/components/section-heading";
import { SourceList } from "@/components/source-list";
import { StatusBadge } from "@/components/status-badge";
import { siteConfig } from "@/config/site";
import { pageById, pageIsAvailable, publishedPages, text } from "@/lib/content";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";
import type { HomeHeroVariant, PageImage, PageRecord, PageSection, PageTable } from "@/lib/types";
import { cx } from "@/lib/utils";

function TableView({ table, locale }: { table: PageTable; locale: Locale }) {
  return (
    <div className="ui-surface overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-panel/80 text-xs uppercase tracking-wider text-slate-500">
            {table.columns.map((column, index) => (
              <th key={`${text(column, locale)}-${index}`} scope="col" className="px-4 py-3 font-semibold">
                {text(column, locale)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line/60 last:border-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className={cellIndex === 0 ? "px-4 py-3 align-top font-medium text-slate-200" : "px-4 py-3 align-top leading-6 text-slate-400"}
                >
                  {text(cell, locale)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type MediaLayout = "full" | "compact" | "hero";

function isCompactMedia(image: PageImage): boolean {
  return image.fit === "contain" || image.ratio === "square" || image.ratio === "portrait";
}

function MediaFigure({ image, locale, layout = "full" }: { image: PageImage; locale: Locale; layout?: MediaLayout }) {
  const sizes = layout === "compact"
    ? COMPACT_MEDIA_SIZES
    : layout === "hero"
      ? HERO_MEDIA_SIZES
      : ARTICLE_MEDIA_SIZES;
  return (
    <ContentImage sizes={sizes} image={{ src: image.src, label: image.label ? text(image.label, locale) : undefined, alt: text(image.alt, locale), caption: image.caption ? text(image.caption, locale) : undefined, ratio: image.ratio, fit: image.fit }} />
  );
}

function InlineSectionMedia({ images, locale }: { images: PageImage[]; locale: Locale }) {
  if (images.length === 0) return null;
  const videoImages = images.filter((image) => !isCompactMedia(image));
  const compactImages = images.filter(isCompactMedia);
  return (
    <>
      {videoImages.length > 0 && (
        <div data-media-layout="video-stack" className="mx-auto max-w-[760px] space-y-5">
          {videoImages.map((image) => <MediaFigure key={image.id ?? image.src} image={image} locale={locale} />)}
        </div>
      )}
      {compactImages.length > 0 && (
        <div data-media-layout="compact-grid" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {compactImages.map((image) => <MediaFigure key={image.id ?? image.src} image={image} layout="compact" locale={locale} />)}
        </div>
      )}
    </>
  );
}

function SectionView({ section, locale, images }: { section: PageSection; locale: Locale; images: PageImage[] }) {
  return (
    <section aria-labelledby={section.id} className="scroll-mt-24 space-y-4">
      <SectionHeading id={section.id} title={text(section.title, locale)} />
      {section.spoilerLevel && <StatusBadge status={text(section.spoilerLevel, locale)} />}
      {section.summary && <p className="max-w-3xl text-sm leading-6 text-slate-300">{text(section.summary, locale)}</p>}
      {section.paragraphs?.map((paragraph, index) => <p key={index} className="max-w-3xl text-sm leading-7 text-slate-400">{text(paragraph, locale)}</p>)}
      <InlineSectionMedia images={images} locale={locale} />
      {section.cards && (
        <div className="grid gap-4 md:grid-cols-2">
          {section.cards.map((card) => {
            const linkedPage = card.pageId ? pageById(card.pageId) : undefined;
            const href = linkedPage && pageIsAvailable(linkedPage, locale)
              ? localizedHref(locale, linkedPage.route)
              : card.href
                ? localizedHref(locale, card.href)
                : undefined;
            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-bold tracking-wide text-slate-100">{text(card.title, locale)}</h3>
                  {card.status && <StatusBadge status={text(card.status, locale)} />}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{text(card.summary, locale)}</p>
              </>
            );
            return href ? (
              <Link key={text(card.title, locale)} href={href} className="ui-surface ui-interactive group rounded-lg border border-line bg-panel/60 p-5 hover:border-amber-400/40 hover:bg-panel">{body}</Link>
            ) : (
              <article key={text(card.title, locale)} className="ui-surface rounded-lg border border-line bg-panel/60 p-5">{body}</article>
            );
          })}
        </div>
      )}
      {section.bullets && <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-400 marker:text-amber-500/70">{section.bullets.map((bullet, index) => <li key={index}>{text(bullet, locale)}</li>)}</ul>}
      {section.table && <TableView table={section.table} locale={locale} />}
    </section>
  );
}

function HomeMedia({ locale }: { locale: Locale }) {
  const heroImage = siteConfig.heroImage;
  const heroVideo = siteConfig.heroVideo;
  if (!heroImage && !heroVideo) return null;
  const imageVariant: HomeHeroVariant = siteConfig.mediaPresentation.homeHeroVariant
    ?? (heroImage?.fit === "contain" || heroImage?.ratio === "square" || heroImage?.ratio === "portrait" ? "compact-square" : "wide-video");
  return (
    <section className="home-hero-media-frame" aria-label="Featured media">
      {heroImage && (
        <div className={cx("home-hero-media", `home-hero-media--${imageVariant}`)}>
          <ContentImage
            sizes={imageVariant === "compact-square" ? HERO_COMPACT_MEDIA_SIZES : HERO_MEDIA_SIZES}
            image={{ src: heroImage.src, label: heroImage.label ? text(heroImage.label, locale) : undefined, alt: text(heroImage.alt, locale), caption: heroImage.caption ? text(heroImage.caption, locale) : undefined, ratio: heroImage.ratio, fit: heroImage.fit }}
            bare
            preload
          />
        </div>
      )}
      {heroVideo && (
        <div className="home-hero-media home-hero-media--wide-video">
          <HeroMedia video={heroVideo} />
        </div>
      )}
    </section>
  );
}

function PageImages({ images, locale }: { images: PageImage[]; locale: Locale }) {
  if (images.length === 0) return null;
  return (
    <section aria-labelledby="page-media" className="space-y-4">
      <SectionHeading id="page-media" title="Additional media" />
      <InlineSectionMedia images={images} locale={locale} />
    </section>
  );
}

export function GuideArticle({ page, locale }: { page: PageRecord; locale: Locale }) {
  const imageById = new Map(page.images.map((image) => [image.id ?? image.src, image]));
  const sectionImages = (section: PageSection) => (section.imageIds ?? [])
    .map((imageId) => imageById.get(imageId))
    .filter((image): image is PageImage => Boolean(image));
  const placedImageIds = new Set(page.sections.flatMap((section) => section.imageIds ?? []));
  const unplacedImages = page.images.filter((image) => !placedImageIds.has(image.id ?? image.src) && !(page.pageType === "Home" && image.src === siteConfig.heroImage?.src));
  const tocItems = [
    ...page.sections.map((section) => ({ id: section.id, title: text(section.title, locale) })),
    ...(unplacedImages.length > 0 ? [{ id: "page-media", title: "Additional media" }] : []),
    ...(page.faq && page.faq.length > 0 ? [{ id: "faq", title: "FAQ" }] : []),
  ];
  const sectionPages = publishedPages(locale).filter((candidate) => candidate.section === page.section);
  const sectionHub = sectionPages.find((candidate) => candidate.pageType === "Hub");
  const sectionArticles = sectionPages.filter((candidate) => candidate.pageType !== "Hub" && candidate.page_id !== "home");
  const currentIndex = sectionArticles.findIndex((candidate) => candidate.page_id === page.page_id);
  const relatedCandidates = page.pageType === "Hub"
    ? sectionArticles.slice(0, 3)
    : [sectionHub, sectionArticles[currentIndex - 1], sectionArticles[currentIndex + 1]];
  const related = relatedCandidates.filter((candidate, index, candidates): candidate is PageRecord => Boolean(
    candidate &&
    candidate.page_id !== page.page_id &&
    pageIsAvailable(candidate, locale) &&
    candidates.findIndex((item) => item?.page_id === candidate.page_id) === index,
  ));
  const articleAdAfter = Math.max(1, Math.ceil(page.sections.length / 2));
  const showRelated = page.pageType !== "Home" || related.length > 0;
  if (showRelated) tocItems.push({ id: "related-pages", title: "Continue in this section" });
  const showArticleAd = page.pageType !== "Home" && page.pageType !== "Hub" && page.pageType !== "Source";

  // A resolvable primary action turns the quick answer into one action card.
  // Without one, the quick answer keeps its reference panel and status badge,
  // so ordinary article pages are unchanged.
  const actionPage = page.primaryAction?.pageId ? pageById(page.primaryAction.pageId) : undefined;
  const actionHref = page.primaryAction
    ? actionPage && pageIsAvailable(actionPage, locale)
      ? localizedHref(locale, actionPage.route)
      : page.primaryAction.href
        ? localizedHref(locale, page.primaryAction.href)
        : undefined
    : undefined;
  const quickAnswer = page.primaryAction && actionHref ? (
    <ActionCard
      title={text(page.quickAnswer.title, locale)}
      description={text(page.quickAnswer.body, locale)}
      action={{ label: text(page.primaryAction.label, locale), href: actionHref }}
    />
  ) : (
    <NoticePanel title={text(page.quickAnswer.title, locale)} variant="info"><p>{text(page.quickAnswer.body, locale)}</p><div className="mt-3"><StatusBadge status={text(page.quickAnswer.status, locale)} /></div></NoticePanel>
  );

  return (
    <article data-page-id={page.page_id} data-page-type={page.pageType} className="space-y-6">
      <Breadcrumbs route={page.route} locale={locale} />
      {page.pageType === "Home" && <HomeMedia locale={locale} />}
      <PageWithToc items={tocItems}>
        <PageHeader eyebrow={text(page.pageStatus, locale)} title={text(page.title, locale)} summary={text(page.intro, locale)} status={text(page.spoilerLevel, locale)} />
        {quickAnswer}
        {page.pageType === "Home" && <AdSlot placement="home-banner" format="responsive-banner" />}
        <div className="min-w-0 space-y-12">
          {page.sections.map((section, index) => <Fragment key={section.id}><SectionView section={section} locale={locale} images={sectionImages(section)} />{showArticleAd && index + 1 === articleAdAfter && <AdSlot placement="article-banner" format="responsive-banner" />}</Fragment>)}
          <PageImages images={unplacedImages} locale={locale} />
        </div>
        <NoticePanel title={text(page.boundary.title, locale)} variant="boundary"><ul className="list-disc space-y-1.5 pl-5 marker:text-amber-500/70">{page.boundary.items.map((item, index) => <li key={index}>{text(item, locale)}</li>)}</ul></NoticePanel>
        {page.faq && page.faq.length > 0 && <section aria-labelledby="faq" className="space-y-5"><SectionHeading id="faq" title="FAQ" /><div className="ui-surface divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel/65">{page.faq.map((faq, index) => <details key={index} open={index === 0} className="group p-5"><summary className="ui-control cursor-pointer list-none pr-8 text-sm font-semibold text-slate-200 marker:hidden">{text(faq.question, locale)}<span aria-hidden="true" className="float-right text-slate-600 transition-transform group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-slate-400">{text(faq.answer, locale)}</p></details>)}</div></section>}
        {showRelated && <section aria-labelledby="related-pages" className="space-y-5"><SectionHeading id="related-pages" title="Continue in this section" />{related.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{related.map((candidate) => <Link key={candidate.page_id} href={localizedHref(locale, candidate.route)} className="ui-surface ui-interactive group rounded-xl border border-line bg-panel/65 p-5 hover:border-amber-400/40 hover:bg-panel"><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{candidate.pageType}</p><h3 className="mt-3 font-display text-base font-bold text-slate-100 group-hover:text-amber-300">{text(candidate.title, locale)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text(candidate.description, locale)}</p></Link>)}</div> : <p className="text-sm text-slate-500">This section has no additional published pages.</p>}</section>}
        <SourceList sourceIds={page.sourceIds} locale={locale} heading="Official sources" />
      </PageWithToc>
    </article>
  );
}

