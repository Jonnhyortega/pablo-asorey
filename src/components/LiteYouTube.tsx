"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const ID_PATTERN = /(?:embed\/|v=|youtu\.be\/)([\w-]{11})/;

// Muestra la portada y monta el iframe de YouTube recién al tocar play
export default function LiteYouTube({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const id = url.match(ID_PATTERN)?.[1];

  const iframeProps = {
    title,
    className: "absolute inset-0 h-full w-full",
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    referrerPolicy: "strict-origin-when-cross-origin" as const,
    allowFullScreen: true,
  };

  if (!id) {
    return (
      <div className="relative aspect-video w-full">
        <iframe src={url} {...iframeProps} />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-surface">
      {playing ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} {...iframeProps} />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Reproducir: ${title}`} className="group absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-70 saturate-[.7] transition-opacity duration-300 group-hover:opacity-90"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold bg-bg/60 text-gold transition-all duration-300 group-hover:scale-105 group-hover:bg-gold group-hover:text-bg">
            <Play className="ml-1 h-7 w-7" fill="currentColor" strokeWidth={0} />
          </span>
        </button>
      )}
    </div>
  );
}
