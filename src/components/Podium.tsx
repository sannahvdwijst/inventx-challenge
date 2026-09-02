import { ParticipantScore } from "@/lib/types";
import { AstronautDancing, AstronautProud, AstronautWaving } from "@/components/Astronauts";

function Avatar({ p, sizeClass }: { p: ParticipantScore; sizeClass: string }) {
  const initials = p.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`overflow-hidden rounded-full border-2 border-cap-light-blue/60 bg-cap-dark-blue shadow-[0_0_20px_-4px_rgba(29,184,242,0.6)] ${sizeClass}`}
    >
      {p.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar_url} alt={p.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-cap-light-blue sm:text-base">
          {initials}
        </div>
      )}
    </div>
  );
}

const SPOTS = [
  {
    rank: 2,
    astronaut: AstronautWaving,
    astronautClass: "h-10 w-10 sm:h-20 sm:w-20",
    avatarClass: "h-12 w-12 sm:h-16 sm:w-16",
    podiumClass: "h-16 w-16 sm:h-24 sm:w-28",
  },
  {
    rank: 1,
    astronaut: AstronautDancing,
    astronautClass: "h-12 w-12 sm:h-24 sm:w-24",
    avatarClass: "h-14 w-14 sm:h-20 sm:w-20",
    podiumClass: "h-24 w-16 sm:h-32 sm:w-28",
  },
  {
    rank: 3,
    astronaut: AstronautProud,
    astronautClass: "h-9 w-9 sm:h-16 sm:w-16",
    avatarClass: "h-11 w-11 sm:h-14 sm:w-14",
    podiumClass: "h-12 w-16 sm:h-16 sm:w-28",
  },
] as const;

export function Podium({ scores }: { scores: ParticipantScore[] }) {
  const byRank = [scores[0], scores[1], scores[2]];

  return (
    <div className="flex flex-row items-end justify-center gap-2 sm:gap-4">
      {SPOTS.map(({ rank, astronaut: Astronaut, astronautClass, avatarClass, podiumClass }) => {
        const p = byRank[rank - 1];
        if (!p) return <div key={rank} className="w-16 sm:w-28" />;

        return (
          <div key={p.id} className="flex flex-col items-center">
            <Astronaut className={astronautClass} />
            <div className="-mt-1 sm:-mt-2">
              <Avatar p={p} sizeClass={avatarClass} />
            </div>
            <p className="mt-1.5 max-w-[5rem] truncate text-center text-xs font-bold text-white sm:mt-2 sm:max-w-[9rem] sm:text-base">
              {p.name}
            </p>
            <p className="max-w-[5rem] truncate text-center text-[10px] text-white/50 sm:max-w-[9rem] sm:text-xs">
              {p.department}
              {p.team ? ` · ${p.team}` : ""}
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-cap-light-blue sm:mt-1 sm:text-lg">
              {p.total_score} pts
            </p>

            <div
              className={`mt-2 flex flex-col items-center justify-start rounded-t-2xl border border-b-0 border-cap-light-blue/30 bg-gradient-to-b from-cap-blue/40 to-cap-dark-blue/60 pt-1.5 shadow-[0_0_30px_-10px_rgba(29,184,242,0.5)] sm:mt-3 sm:pt-2 ${podiumClass}`}
            >
              <span className="text-base font-extrabold text-white/90 sm:text-2xl">#{rank}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
