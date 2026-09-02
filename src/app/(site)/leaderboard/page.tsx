import { supabase } from "@/lib/supabase";
import { ParticipantScore } from "@/lib/types";
import { VideoBackground } from "@/components/VideoBackground";

export const revalidate = 0;

export default async function LeaderboardPage() {
  const { data } = await supabase
    .from("participant_scores")
    .select("*")
    .order("total_score", { ascending: false })
    .order("registered_at", { ascending: true });

  const scores = (data as ParticipantScore[]) ?? [];
  const [first, second, third] = scores;

  return (
    <div className="min-h-screen">
      <VideoBackground />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-1 text-white/60">Live standings for the InventX Challenge.</p>

        {scores.length === 0 ? (
          <p className="mt-10 text-white/50">
            No participants yet — be the first to join and complete a challenge!
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[first, second, third].map((p, i) =>
                p ? (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-5 text-center ${
                      i === 0
                        ? "border-cap-light-blue bg-cap-blue text-white sm:order-2 sm:scale-105"
                        : "border-white/15 bg-white/5 text-white"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                      #{i + 1}
                    </p>
                    <p className="mt-1 truncate text-lg font-bold">{p.name}</p>
                    <p className="text-sm opacity-70">
                      {p.department}
                      {p.team ? ` · ${p.team}` : ""}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold">{p.total_score} pts</p>
                    <p className="text-xs opacity-70">{p.challenges_completed} challenges</p>
                  </div>
                ) : (
                  <div key={i} className="hidden sm:block" />
                )
              )}
            </div>

            <div className="mt-10 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-cap-dark-blue text-white">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-right">Completed</th>
                    <th className="px-4 py-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((p, i) => (
                    <tr key={p.id} className="border-t border-white/10 bg-cap-dark-blue/40">
                      <td className="px-4 py-3 font-semibold text-white">{i + 1}</td>
                      <td className="px-4 py-3 text-white">{p.name}</td>
                      <td className="px-4 py-3 text-white/60">{p.department}</td>
                      <td className="px-4 py-3 text-white/60">{p.team ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-white/60">
                        {p.challenges_completed}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-cap-light-blue">
                        {p.total_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
