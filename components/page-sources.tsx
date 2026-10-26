import { SourceList } from "@/components/source-list";
import type { Locale } from "@/lib/i18n/config";

/** Compatibility wrapper for the framework's single official source block. */
export function PageSources({
  sourceIds,
  locale: _locale,
}: {
  sourceIds?: readonly string[];
  locale: Locale;
}) {
  return <SourceList sourceIds={sourceIds} locale={_locale} heading="Official sources" />;
}
