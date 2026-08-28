import { supabaseAdmin } from "@/lib/supabase-admin";
import { Challenge, ParticipantScore } from "@/lib/types";
import { organiserLogout } from "./actions";

export const revalidate = 0;

export default async function OrganiserDashboard() {
  const [{ data: scoresData }, { data: challengesData }, { data: completionsData }] =
    await Promise.all([
      supabaseAdmin
        .from("participant_scores")
        .select("*")
        .order("total_score", { ascending: false })
        .order("registered_at", { ascending: true }),
      supabaseAdmin.from("challenges").select("*"),
      supabaseAdmin.from("completions").select("challenge_id"),
    ]);

  const scores = (scoresData as ParticipantScore[]) ?? [];
  const challenges = (challengesData as Challenge[]) ?? [];
  const completions = completionsData ?? [];

  const totalParticipants = scores.length;
  const totalCompletions = completions.length;
  const averageScore = totalParticipants
    ? Math.round(scores.reduce((sum, p) => sum + p.total_score, 0) / totalParticipants)
    : 0;
  const completionPercentage =
    totalParticipants && challenges.length
      ? Math.round((totalCompletions / (totalParticipants * challenges.length)) * 100)
      : 0;

  const completionCounts = new Map<string, number>();
  for (const c of completions) {
    const id = c.challenge_id as string;
    completionCounts.set(id, (completionCounts.get(id) ?? 0) + 1);
  }
  let mostCompleted: { title: string; count: number } | null = null;
  for (const challenge of challenges) {
    const count = completionCounts.get(challenge.id) ?? 0;
    if (!mostCompleted || count > mostCompleted.count) {
      mostCompleted = { title: challenge.title, count };
    }
  }

  const [first, second, third] = scores;

  const domainsCount = scores.filter((p) => p.department === "Domains").length;
  const inventCount = scores.filter((p) => p.department === "Invent").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cap-dark-blue">Organiser Dashboard</h1>
          <div className="gradient-bar mt-2 h-1 w-16 rounded-full" />
          <p className="mt-3 text-cap-dark-blue/60">InventX Challenge — live event overview.</p>
        </div>
        <form action={organiserLogout}>
          <button
            type="submit"
            className="rounded-lg border border-cap-dark-blue/20 px-4 py-2 text-sm font-semibold text-cap-dark-blue hover:bg-cap-dark-blue/5"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Participants" value={totalParticipants} />
        <StatCard label="Domains" value={domainsCount} />
        <StatCard label="Invent" value={inventCount} />
        <StatCard label="Challenges completed" value={totalCompletions} />
        <StatCard label="Average score" value={averageScore} />
        <StatCard label="Completion %" value={`${completionPercentage}%`} />
        <StatCard
          label="Most completed"
          value={mostCompleted && mostCompleted.count > 0 ? mostCompleted.title : "—"}
          small
        />
      </section>

      {/* Winner view */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-cap-dark-blue">Top 3</h2>
        {totalParticipants === 0 ? (
          <p className="text-cap-dark-blue/50">No participants yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[first, second, third].map((p, i) =>
              p ? (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-5 text-center ${
                    i === 0
                      ? "bg-stars border-cap-light-blue text-white sm:order-2 sm:scale-105"
                      : "border-cap-dark-blue/15 bg-white text-cap-dark-blue"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {i === 0 ? "🏆 Current Winner" : `#${i + 1}`}
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
        )}
      </section>

      {/* Participant overview */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-cap-dark-blue">All Participants</h2>
        <div className="overflow-x-auto rounded-xl border border-cap-dark-blue/10">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-cap-dark-blue text-white">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-right">Completed</th>
                <th className="px-4 py-3 text-right">Completion %</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-cap-dark-blue/50">
                    No participants yet.
                  </td>
                </tr>
              )}
              {scores.map((p, i) => (
                <tr key={p.id} className="border-t border-cap-dark-blue/10">
                  <td className="px-4 py-3 font-semibold text-cap-dark-blue">{i + 1}</td>
                  <td className="px-4 py-3 text-cap-dark-blue">{p.name}</td>
                  <td className="px-4 py-3 text-cap-dark-blue/60">{p.department}</td>
                  <td className="px-4 py-3 text-cap-dark-blue/60">{p.team ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-cap-dark-blue/60">
                    {p.challenges_completed}
                  </td>
                  <td className="px-4 py-3 text-right text-cap-dark-blue/60">
                    {challenges.length
                      ? Math.round((p.challenges_completed / challenges.length) * 100)
                      : 0}
                    %
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-cap-blue">
                    {p.total_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-cap-dark-blue/10 bg-white p-4">
      <p className="text-xs font-medium text-cap-dark-blue/50">{label}</p>
      <p className={`mt-1 font-bold text-cap-dark-blue ${small ? "text-sm" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}
