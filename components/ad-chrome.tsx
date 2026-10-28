import { AdSlot } from "@/components/ad-slot";
import { DismissibleTopAd } from "@/components/dismissible-top-ad";
import { siteConfig } from "@/config/site";
import bundle from "@/config/ad-units.json";

export function getAdChromeState() {
  const ads = siteConfig.ads;
  const available = bundle.complete && bundle.domain === new URL(siteConfig.siteUrl).hostname.replace(/^www\./, "") && bundle.units.some(unit => unit.format === "160x600");
  const visible = Boolean(ads.desktopChrome?.enabled && ads.enabled && available);
  return {
    top: visible && Boolean(ads.placements?.["top-sticky"]),
    left: visible && Boolean(ads.placements?.["left-sticky"]),
  };
}

export function AdChrome() {
  const state = getAdChromeState();
  return <>
    {state.top && <DismissibleTopAd />}
    {state.left && <div className="site-left-ad-rail"><AdSlot placement="left-sticky" format="vertical-rail" /></div>}
  </>;
}
