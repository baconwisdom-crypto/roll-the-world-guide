"use client";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import bundle from "@/config/ad-units.json";
import type { AdPlacement } from "@/lib/types";
type Props = { placement: AdPlacement; format: "top-sticky" | "vertical-rail" | "responsive-banner" | "sidebar-square"; className?: string };
const validBundle = bundle.complete && bundle.domain === new URL(siteConfig.siteUrl).hostname.replace(/^www\./, "");
function NativeAd() {
 const host = useRef<HTMLDivElement>(null);
 const unit = bundle.units.find(item => item.format === "native");
 useEffect(() => {
  if (!host.current || !unit) return;
  const element = host.current;
  const template = document.createElement("template"); template.innerHTML = unit.raw;
  for (const oldScript of template.content.querySelectorAll("script")) {
   const script = document.createElement("script");
   for (const attr of oldScript.attributes) script.setAttribute(attr.name, attr.value);
   script.textContent = oldScript.textContent; oldScript.replaceWith(script);
  }
  element.append(template.content); return () => element.replaceChildren();
 }, [unit]);
 return <div ref={host} data-ad-format="native" />;
}
export function AdSlot({ placement, format, className }: Props) {
 const host = useRef<HTMLElement>(null);
 const [width, setWidth] = useState(0);
 const [desktop, setDesktop] = useState(false);
 useEffect(() => {
  const media = matchMedia("(min-width: 1280px) and (min-height: 700px)");
  const update = () => setDesktop(media.matches);
  update(); media.addEventListener("change", update);
  const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
  if (host.current) observer.observe(host.current);
  return () => { media.removeEventListener("change", update); observer.disconnect(); };
 }, []);
 if (!siteConfig.ads.enabled || !validBundle || !siteConfig.ads.placements?.[placement]) return null;
 if (placement === "left-sticky" && format !== "vertical-rail") return null;
 const native = placement === "article-banner";
 const selected = format === "vertical-rail" ? (desktop ? "160x600" : null)
  : format === "sidebar-square" ? (width >= 299.5 ? "300x250" : null)
  : width >= 727.5 ? "728x90" : width >= 319.5 ? "320x50" : width >= 299.5 ? "300x250" : null;
 const unit = bundle.units.find(item => item.format === selected);
 return <aside ref={host} className={["ad-slot", `ad-slot--${format}`, className].filter(Boolean).join(" ")}
  aria-label="Advertisement" data-ad-placement={placement} data-ad-state="enabled" data-ad-provider="adsterra">
  {(native || unit) && <span className="ad-slot__label">Advertisement</span>}
  {native ? <NativeAd /> : unit && <iframe title={`${unit.format} advertisement`} data-ad-format={unit.format}
   width={unit.width!} height={unit.height!} scrolling="no" style={{ border: 0, display: "block", flexShrink: 0 }}
   srcDoc={`<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body>${unit.raw}</body></html>`} />}
 </aside>;
}
