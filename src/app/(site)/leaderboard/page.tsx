import { supabase } from "@/lib/supabase";
import { ParticipantScore } from "@/lib/types";
import { VideoBackground } from "@/components/VideoBackground";
import { Podium } from "@/components/Podium";

export const revalidate = 0;

export default async function LeaderboardPage() {
  const { data } = await supabase
    .from("participant_scores")
    .select("*")
    .order("total_score", { ascending: false })
    .order("registered_at", { ascending: true });

  const scores = (data as ParticipantScore[]) ?? [];

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
            <div className="mt-10">
              <Podium scores={scores} />
            </div>

            <div className="mt-14 overflow-x-auto rounded-xl border border-white/10">
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
