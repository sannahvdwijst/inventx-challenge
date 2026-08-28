"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredParticipant } from "@/lib/participant";
import { GALLERY_SELECT, mapGalleryRows, RawCompletionPhotoRow } from "@/lib/gallery";
import { GalleryPhoto, PhotoGrid } from "@/components/PhotoGrid";
import { GalleryTabs } from "@/components/GalleryTabs";

export default function MyGalleryPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null);

  useEffect(() => {
    const participant = getStoredParticipant();
    if (!participant) {
      router.replace("/join");
      return;
    }

    async function load() {
      const { data } = await supabase
        .from("completions")
        .select(GALLERY_SELECT)
        .eq("participant_id", participant!.id)
        .not("photo_url", "is", null)
        .order("completed_at", { ascending: false });

      setPhotos(mapGalleryRows(data as unknown as RawCompletionPhotoRow[]));
    }

    load();
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-cap-dark-blue">Gallery</h1>
      <p className="mt-1 text-cap-dark-blue/60">Photos you&apos;ve uploaded so far.</p>

      <GalleryTabs active="mine" />

      {photos === null ? (
        <p className="mt-10 text-cap-dark-blue/50">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="mt-10 text-cap-dark-blue/50">
          You haven&apos;t uploaded any photos yet — complete a challenge to add one here.
        </p>
      ) : (
        <div className="mt-6">
          <PhotoGrid photos={photos} />
        </div>
      )}
    </div>
  );
}
