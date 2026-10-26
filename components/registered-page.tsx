import { GuideArticle } from "@/components/guide-article";
import { StructuredPage } from "@/components/structured-page";
import { structureFor } from "@/lib/architecture";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";
import type { PageRecord } from "@/lib/types";

export function RegisteredPage({ page, locale }: { page: PageRecord; locale: Locale }) {
  const layout = structureFor(page.page_id);
  if (layout) return <StructuredPage page={page} layout={layout} locale={locale} />;
  if (siteConfig.architecture?.enabled) return <GuideArticle page={page} locale={locale} />;
  return <GuideArticle page={page} locale={locale} />;
}
