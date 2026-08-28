import { GalleryPhoto } from "@/components/PhotoGrid";

export interface RawCompletionPhotoRow {
  id: string;
  photo_url: string | null;
  completed_at: string;
  participants: { name: string } | null;
  challenges: { title: string; category: string } | null;
}

export const GALLERY_SELECT =
  "id, photo_url, completed_at, participants(name), challenges(title, category)";

export function mapGalleryRows(rows: RawCompletionPhotoRow[] | null): GalleryPhoto[] {
  return (rows ?? [])
    .filter((row) => row.photo_url)
    .map((row) => ({
      id: row.id,
      photoUrl: row.photo_url!,
      completedAt: row.completed_at,
      participantName: row.participants?.name ?? "Someone",
      challengeTitle: row.challenges?.title ?? "A challenge",
    }));
}
