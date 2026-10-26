"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

type IconState = "loading" | "loaded" | "error";

export function SiteBrandMark({ shortName }: { shortName: string }) {
  const source = siteConfig.brandIcon?.src;
  const [state, setState] = useState<IconState>(source ? "loading" : "error");
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;
    setState(image.naturalWidth > 0 ? "loaded" : "error");
  }, [source]);

  return (
    <span
      aria-hidden="true"
      className="site-mark"
      data-icon-state={state}
      data-site-brand-icon="true"
    >
      {source && (
        <img
          alt=""
          className="site-mark__icon"
          decoding="async"
          height="40"
          loading="eager"
          onError={() => setState("error")}
          onLoad={() => setState("loaded")}
          ref={imageRef}
          src={source}
          width="40"
        />
      )}
      <span className="site-mark__fallback">{shortName}</span>
    </span>
  );
}
