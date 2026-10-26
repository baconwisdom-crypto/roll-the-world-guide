"use client";

import { useState } from "react";
import type { ReferenceCatalogData } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { LocalizedText } from "@/lib/types";

const text = (value: LocalizedText, locale: Locale) => value[locale] ?? value.en;

/** A searchable, server-rendered reference. Records and scope belong to content. */
export function ReferenceCatalog({ catalog, locale }: { catalog: ReferenceCatalogData; locale: Locale }) {
  const [query, setQuery] = useState("");
  const rows = catalog.rows.filter(row => text(row.name, locale).toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="reference-catalog">
    <label className="catalog-search">{text(catalog.searchLabel, locale)}
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={text(catalog.placeholder, locale)} />
    </label>
    <div className="catalog-result-line"><p aria-live="polite">{rows.length} / {catalog.rows.length} {text(catalog.resultLabel, locale)}</p><button type="button" onClick={() => setQuery("")} disabled={!query}>{text(catalog.clearLabel, locale)}</button></div>
    {rows.length === 0 && <p className="ui-prose" role="status">{text(catalog.emptyLabel, locale)}</p>}
    <ul className="catalog-records">{rows.map(row => <li key={text(row.name, locale)}>
      <details><summary><strong>{text(row.name, locale)}</strong><span>{text(row.location, locale)}</span></summary>
        <dl>{catalog.fields.map((field, index) => <div key={index}><dt>{text(field, locale)}</dt><dd>{text(row.values[index], locale)}</dd></div>)}</dl>
      </details>
    </li>)}</ul>
  </div>;
}
