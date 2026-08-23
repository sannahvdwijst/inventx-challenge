import { allBadges, Badge } from "@/lib/badges";

export function BadgeShelf({ earned }: { earned: Badge[] }) {
  const earnedIds = new Set(earned.map((b) => b.id));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {allBadges().map((badge) => {
        const isEarned = earnedIds.has(badge.id);
        return (
          <div
            key={badge.id}
            title={`${badge.label} — ${badge.description}`}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              isEarned
                ? "border-cap-light-blue bg-white/10 text-white"
                : "border-white/10 bg-transparent text-white/30 grayscale"
            }`}
          >
            <span className="text-base">{badge.emoji}</span>
            <span>{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}
