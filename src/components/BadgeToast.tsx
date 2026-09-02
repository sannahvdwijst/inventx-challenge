import { Badge } from "@/lib/badges";

export function BadgeToast({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="animate-badge-pop pointer-events-auto flex items-center gap-3 rounded-full border border-cap-blue bg-white px-5 py-3 shadow-lg"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cap-blue">
              Badge unlocked
            </p>
            <p className="font-bold text-cap-dark-blue">{badge.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
