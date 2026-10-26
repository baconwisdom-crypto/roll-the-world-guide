import type { HeroVideo } from "@/lib/types";

/**
 * YouTube requires muted autoplay, so sound is never promised here:
 * the embed starts muted and the player controls stay enabled.
 */
function buildEmbedUrl(video: HeroVideo): string {
  const params = new URLSearchParams({
    autoplay: "0",
    mute: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${video.videoId}?${params.toString()}`;
}

/**
 * Official promotional video approved explicitly in the site configuration.
 */
export function HeroMedia({ video }: { video: HeroVideo }) {
  return (
    <div className="w-full">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          src={buildEmbedUrl(video)}
          title={video.title.en}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
