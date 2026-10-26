import { AdSlot } from "@/components/ad-slot";
import { DismissibleTopAd } from "@/components/dismissible-top-ad";
import { siteConfig } from "@/config/site";

export function getAdChromeState() {
  const ads = siteConfig.ads;
  // This neutral source has preview slots only. A project's verified provider
  // adapter must supply its own matching availability check before live use.
  const visible = Boolean(ads.desktopChrome?.enabled && !ads.enabled && ads.previewPlaceholders);
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
