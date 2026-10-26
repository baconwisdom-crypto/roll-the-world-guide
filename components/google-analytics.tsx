import Script from "next/script";
import { siteConfig } from "@/lib/site";

export function GoogleAnalytics() {
  const measurementId = siteConfig.analytics.measurementId;
  if (!siteConfig.analytics.enabled || !measurementId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
