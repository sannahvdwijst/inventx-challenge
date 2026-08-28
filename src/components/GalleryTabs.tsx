import Link from "next/link";

export function GalleryTabs({ active }: { active: "all" | "mine" }) {
  return (
    <div className="mt-6 flex gap-2">
      <Link
        href="/gallery"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          active === "all"
            ? "bg-cap-dark-blue text-white"
            : "bg-cap-dark-blue/5 text-cap-dark-blue hover:bg-cap-dark-blue/10"
        }`}
      >
        Everyone
      </Link>
      <Link
        href="/gallery/mine"
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          active === "mine"
            ? "bg-cap-dark-blue text-white"
            : "bg-cap-dark-blue/5 text-cap-dark-blue hover:bg-cap-dark-blue/10"
        }`}
      >
        My photos
      </Link>
    </div>
  );
}
