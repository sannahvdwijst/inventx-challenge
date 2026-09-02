import { supabase } from "@/lib/supabase";
import { GALLERY_SELECT, mapGalleryRows, RawCompletionPhotoRow } from "@/lib/gallery";
import { PhotoGrid } from "@/components/PhotoGrid";
import { GalleryTabs } from "@/components/GalleryTabs";
import { VideoBackground } from "@/components/VideoBackground";

export const revalidate = 0;

export default async function GalleryPage() {
  const { data } = await supabase
    .from("completions")
    .select(GALLERY_SELECT)
    .not("photo_url", "is", null)
    .order("completed_at", { ascending: false });

  const photos = mapGalleryRows(data as unknown as RawCompletionPhotoRow[]);

  return (
    <div className="min-h-screen">
      <VideoBackground />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Gallery</h1>
        <p className="mt-1 text-white/60">
          Every moment captured during the InventX Challenge.
        </p>

        <GalleryTabs active="all" />

        {photos.length === 0 ? (
          <p className="mt-10 text-white/50">
            No photos yet — completed challenges with a photo will show up here.
          </p>
        ) : (
          <div className="mt-6">
            <PhotoGrid photos={photos} />
          </div>
        )}
      </div>
    </div>
  );
}
