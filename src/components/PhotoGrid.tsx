"use client";

import { useEffect, useState } from "react";

export interface GalleryPhoto {
  id: string;
  photoUrl: string;
  completedAt: string;
  participantName: string;
  challengeTitle: string;
}

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const active = activeIndex !== null ? photos[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveIndex(null);
      else if (e.key === "ArrowRight") setActiveIndex((i) => (i === null ? i : Math.min(i + 1, photos.length - 1)));
      else if (e.key === "ArrowLeft") setActiveIndex((i) => (i === null ? i : Math.max(i - 1, 0)));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, photos.length]);

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setActiveIndex(i)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-cap-light-blue/20 bg-white/5 shadow-[0_0_20px_-10px_rgba(29,184,242,0.3)] transition hover:border-cap-light-blue/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.photoUrl}
              alt={`${photo.challengeTitle} — ${photo.participantName}`}
              loading="lazy"
              className="block h-auto w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-left opacity-0 transition group-hover:opacity-100">
              <p className="truncate text-xs font-bold text-white">{photo.participantName}</p>
              <p className="truncate text-[11px] text-white/60">{photo.challengeTitle}</p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 text-3xl font-light text-white/80 hover:text-white"
          >
            ×
          </button>

          {activeIndex! > 0 && (
            <button
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) => (i === null ? i : i - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-2xl text-white hover:bg-white/20 sm:left-6"
            >
              ‹
            </button>
          )}
          {activeIndex! < photos.length - 1 && (
            <button
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((i) => (i === null ? i : i + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-2xl text-white hover:bg-white/20 sm:right-6"
            >
              ›
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.photoUrl}
            alt={`${active.challengeTitle} — ${active.participantName}`}
            className="max-h-[75vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="text-center text-white" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold">{active.challengeTitle}</p>
            <p className="text-sm text-white/60">{active.participantName}</p>
          </div>
        </div>
      )}
    </>
  );
}
