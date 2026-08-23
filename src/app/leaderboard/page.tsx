import { supabase } from "@/lib/supabase";
import { ParticipantScore } from "@/lib/types";

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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-cap-dark-blue">Leaderboard</h1>
      <p className="mt-1 text-cap-dark-blue/60">Live standings for the InventX Challenge.</p>

      {scores.length === 0 ? (
        <p className="mt-10 text-cap-dark-blue/50">
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
                      ? "border-cap-blue bg-cap-blue text-white sm:order-2 sm:scale-105"
                      : "border-cap-dark-blue/15 bg-white text-cap-dark-blue"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                    #{i + 1}
                  </p>
                  <p className="mt-1 truncate text-lg font-bold">{p.name}</p>
                  {p.team && <p className="text-sm opacity-70">{p.team}</p>}
                  <p className="mt-2 text-2xl font-extrabold">{p.total_score} pts</p>
                  <p className="text-xs opacity-70">{p.challenges_completed} challenges</p>
                </div>
              ) : (
                <div key={i} className="hidden sm:block" />
              )
            )}
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border border-cap-dark-blue/10">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-cap-dark-blue text-white">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3 text-right">Completed</th>
                  <th className="px-4 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((p, i) => (
                  <tr key={p.id} className="border-t border-cap-dark-blue/10">
                    <td className="px-4 py-3 font-semibold text-cap-dark-blue">{i + 1}</td>
                    <td className="px-4 py-3 text-cap-dark-blue">{p.name}</td>
                    <td className="px-4 py-3 text-cap-dark-blue/60">{p.team ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-cap-dark-blue/60">
                      {p.challenges_completed}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-cap-blue">
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
  );
}
