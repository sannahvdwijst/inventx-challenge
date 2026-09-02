import { ParticipantScore } from "@/lib/types";
import { AstronautDancing, AstronautProud, AstronautWaving } from "@/components/Astronauts";

function Avatar({ p, size }: { p: ParticipantScore; size: number }) {
  const initials = p.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="overflow-hidden rounded-full border-2 border-cap-light-blue/60 bg-cap-dark-blue shadow-[0_0_20px_-4px_rgba(29,184,242,0.6)]"
      style={{ width: size, height: size }}
    >
      {p.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar_url} alt={p.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-bold text-cap-light-blue">
          {initials}
        </div>
      )}
    </div>
  );
}

const SPOTS = [
  { rank: 2, astronaut: AstronautWaving, podiumHeight: 96, avatarSize: 64, order: "sm:order-1" },
  { rank: 1, astronaut: AstronautDancing, podiumHeight: 132, avatarSize: 80, order: "sm:order-2" },
  { rank: 3, astronaut: AstronautProud, podiumHeight: 72, avatarSize: 56, order: "sm:order-3" },
] as const;

export function Podium({ scores }: { scores: ParticipantScore[] }) {
  const byRank = [scores[0], scores[1], scores[2]];

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-center sm:gap-4">
      {SPOTS.map(({ rank, astronaut: Astronaut, podiumHeight, avatarSize, order }) => {
        const p = byRank[rank - 1];
        if (!p) return <div key={rank} className={`hidden sm:block ${order}`} />;

        return (
          <div key={p.id} className={`flex flex-col items-center ${order}`}>
            <Astronaut className="h-16 w-16 sm:h-20 sm:w-20" />
            <div className="-mt-2">
              <Avatar p={p} size={avatarSize} />
            </div>
            <p className="mt-2 max-w-[9rem] truncate text-center font-bold text-white">
              {p.name}
            </p>
            <p className="max-w-[9rem] truncate text-center text-xs text-white/50">
              {p.department}
              {p.team ? ` · ${p.team}` : ""}
            </p>
            <p className="mt-1 text-lg font-extrabold text-cap-light-blue">{p.total_score} pts</p>

            <div
              className="mt-3 flex w-24 flex-col items-center justify-start rounded-t-2xl border border-b-0 border-cap-light-blue/30 bg-gradient-to-b from-cap-blue/40 to-cap-dark-blue/60 pt-2 shadow-[0_0_30px_-10px_rgba(29,184,242,0.5)] sm:w-28"
              style={{ height: podiumHeight }}
            >
              <span className="text-2xl font-extrabold text-white/90">#{rank}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
