import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cx } from "@/lib/utils";

interface ContentImageData {
  src: string;
  label?: string;
  alt: string;
  caption?: string;
  ratio?: "video" | "square" | "portrait";
  fit?: "cover" | "contain";
}

export const ARTICLE_MEDIA_SIZES = "(min-width: 1280px) calc(100vw - 34rem), (min-width: 1024px) calc(100vw - 18rem), 100vw";
export const COMPACT_MEDIA_SIZES = "(min-width: 1280px) calc((100vw - 38rem) / 3), (min-width: 768px) calc((100vw - 20rem) / 2), 100vw";
export const HERO_MEDIA_SIZES = "(min-width: 1024px) 60vw, 100vw";
export const HERO_COMPACT_MEDIA_SIZES = "(min-width: 768px) 26rem, 100vw";

/** Reusable image frame. Alt text is always retained; visible image text is opt-in. */
export function ContentImage({
  image,
  preload = false,
  className,
  bare = false,
  sizes,
}: {
  image: ContentImageData;
  preload?: boolean;
  className?: string;
  bare?: boolean;
  sizes?: string;
}) {
  const ratioClass = image.ratio === "square" ? "aspect-square" : image.ratio === "portrait" ? "aspect-[3/4]" : "aspect-video";
  const fitClass = image.fit === "contain" ? "object-contain p-2" : "object-cover";
  const showImageText = siteConfig.mediaPresentation.showImageText && Boolean(image.label || image.caption);

  return (
    <figure data-content-image data-media-ratio={image.ratio ?? "video"} className={cx(bare ? "overflow-hidden" : "overflow-hidden rounded-xl border border-line bg-panel/60", className)}>
      <div className={cx("relative w-full", ratioClass, image.fit === "contain" && "bg-slate-950/40")}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload={preload}
          sizes={sizes ?? ARTICLE_MEDIA_SIZES}
          className={fitClass}
        />
      </div>
      {showImageText && (
        <figcaption data-image-text className="border-t border-line/70 px-3 py-2 text-xs leading-5 text-slate-500">
          {image.label && <p className="font-display text-sm font-bold tracking-wide text-slate-200">{image.label}</p>}
          {image.caption && <p className={image.label ? "mt-1" : undefined}>{image.caption}</p>}
        </figcaption>
      )}
    </figure>
  );
}
