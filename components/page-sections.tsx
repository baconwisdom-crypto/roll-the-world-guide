import Link from "next/link";
import { ReferenceCatalog } from "@/components/reference-catalog";
import { ARTICLE_MEDIA_SIZES, COMPACT_MEDIA_SIZES, HERO_MEDIA_SIZES, ContentImage } from "@/components/content-image";
import { SectionHeading } from "@/components/section-heading";
import { StatusBadge } from "@/components/status-badge";
import { pageById, pageIsAvailable, text } from "@/lib/content";
import { localizedHref } from "@/lib/i18n/urls";
import type { Locale } from "@/lib/i18n/config";
import type { PageImage, PageSection, PageTable } from "@/lib/types";
export function TableView({ table, locale }: { table: PageTable; locale: Locale }) {
  return (
    <div className="comparison-table-wrap"><p className="table-hint">On small screens, swipe the table to compare all columns.</p><div className="ui-surface overflow-x-auto rounded-lg border" role="region" aria-label="Comparison table" tabIndex={0}>
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-panel/70 text-xs uppercase tracking-wider text-slate-500">
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
                  data-label={text(table.columns[cellIndex], locale)}
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
    </div></div>
  );
}

type MediaLayout = "full" | "compact" | "hero";

function isCompactMedia(image: PageImage): boolean {
  return image.fit === "contain" || image.ratio === "square" || image.ratio === "portrait";
}

export function MediaFigure({ image, locale, layout = "full" }: { image: PageImage; locale: Locale; layout?: MediaLayout }) {
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

export function SectionView({ section, locale, images }: { section: PageSection; locale: Locale; images: PageImage[] }) {
  return (
    <section aria-labelledby={section.id} className="min-w-0 space-y-4">
      <SectionHeading id={section.id} title={text(section.title, locale)} />
      {section.sourceNote && <p className="answer-source-note">{text(section.sourceNote, locale)}</p>}
      {section.spoilerLevel && <StatusBadge status={text(section.spoilerLevel, locale)} />}
      {section.summary && <p className="ui-prose ui-prose--lead">{text(section.summary, locale)}</p>}
      {section.paragraphs?.map((paragraph, index) => <p key={index} className="ui-prose">{text(paragraph, locale)}</p>)}
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
                  <h3 className="ui-card-title text-slate-100 group-hover:text-amber-300">{text(card.title, locale)}</h3>
                  {card.status && <StatusBadge status={text(card.status, locale)} />}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{text(card.summary, locale)}</p>
              </>
            );
            return href ? (
              <Link key={text(card.title, locale)} href={href} className="ui-surface-raised ui-interactive group rounded-lg border p-5">{body}</Link>
            ) : (
              <article key={text(card.title, locale)} className="ui-surface rounded-lg border p-5">{body}</article>
            );
          })}
        </div>
      )}
      {section.bullets && <ul className="ui-prose list-disc space-y-2 pl-5 marker:text-amber-500/70">{section.bullets.map((bullet, index) => <li key={index}>{text(bullet, locale)}</li>)}</ul>}
      {section.table && <TableView table={section.table} locale={locale} />}
      {section.catalog && <ReferenceCatalog catalog={section.catalog} locale={locale} />}
      {section.steps && <ol className="task-steps">{section.steps.map((step, index) => <li key={index}><h3>{index + 1}. {text(step.title, locale)}</h3><dl><div><dt>Before you start</dt><dd>{text(step.prerequisite, locale)}</dd></div><div><dt>Action</dt><dd>{text(step.action, locale)}</dd></div><div><dt>Success check</dt><dd>{text(step.success, locale)}</dd></div><div><dt>If it fails</dt><dd>{text(step.fallback, locale)}</dd></div></dl></li>)}</ol>}
    </section>
  );
}

