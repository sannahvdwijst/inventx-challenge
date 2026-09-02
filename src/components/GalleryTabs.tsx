import Link from "next/link";

export function GalleryTabs({ active }: { active: "all" | "mine" }) {
  return (
    <div className="mt-6 flex gap-2">
      <Link
        href="/gallery"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          active === "all"
            ? "bg-white text-cap-dark-blue"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        Everyone
      </Link>
      <Link
        href="/gallery/mine"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          active === "mine"
            ? "bg-white text-cap-dark-blue"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        My photos
      </Link>
    </div>
  );
}
