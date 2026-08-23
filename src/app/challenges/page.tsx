"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredParticipant, StoredParticipant } from "@/lib/participant";
import { CATEGORY_LABELS, Category, Challenge } from "@/lib/types";
import { Disclaimer } from "@/components/Disclaimer";

const CATEGORY_ORDER: Category[] = ["networking", "fun_social", "ai", "photo", "party", "bonus"];

export default function ChallengesPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<StoredParticipant | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredParticipant();
    if (!stored) {
      router.replace("/");
      return;
    }
    // Reading localStorage is only possible client-side, so this one-time
    // hydration from browser storage has to happen in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticipant(stored);
  }, [router]);

  useEffect(() => {
    if (!participant) return;

    async function load() {
      const [{ data: challengeData }, { data: completionData }] = await Promise.all([
        supabase.from("challenges").select("*").order("category").order("points"),
        supabase
          .from("completions")
          .select("challenge_id")
          .eq("participant_id", participant!.id),
      ]);

      setChallenges((challengeData as Challenge[]) ?? []);
      setCompletedIds(new Set((completionData ?? []).map((c) => c.challenge_id as string)));
      setLoading(false);
    }

    load();
  }, [participant]);

  const totalScore = useMemo(
    () =>
      challenges
        .filter((c) => completedIds.has(c.id))
        .reduce((sum, c) => sum + c.points, 0),
    [challenges, completedIds]
  );

  const grouped = useMemo(() => {
    const map = new Map<Category, Challenge[]>();
    for (const c of challenges) {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    }
    return map;
  }, [challenges]);

  async function toggleChallenge(challenge: Challenge) {
    if (!participant || pendingId) return;
    setPendingId(challenge.id);

    const isCompleted = completedIds.has(challenge.id);

    if (isCompleted) {
      const { error } = await supabase
        .from("completions")
        .delete()
        .eq("participant_id", participant.id)
        .eq("challenge_id", challenge.id);

      if (!error) {
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(challenge.id);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("completions")
        .insert({ participant_id: participant.id, challenge_id: challenge.id });

      if (!error) {
        setCompletedIds((prev) => new Set(prev).add(challenge.id));
      }
    }

    setPendingId(null);
  }

  if (!participant || loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-cap-dark-blue/60">
        Loading challenges...
      </div>
    );
  }

  const progress = challenges.length ? completedIds.size / challenges.length : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 rounded-2xl bg-cap-dark-blue p-6 text-white">
        <p className="text-sm text-white/70">Welcome, {participant.name}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-bold">{totalScore} pts</p>
            <p className="text-sm text-white/70">
              {completedIds.size} / {challenges.length} challenges completed
            </p>
          </div>
          <div className="w-full max-w-xs sm:w-56">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-cap-light-blue transition-all"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Disclaimer />
      </div>

      <div className="space-y-10">
        {CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((category) => (
          <section key={category}>
            <h2 className="mb-4 text-xl font-bold text-cap-dark-blue">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.get(category)!.map((challenge) => {
                const isCompleted = completedIds.has(challenge.id);
                return (
                  <button
                    key={challenge.id}
                    onClick={() => toggleChallenge(challenge)}
                    disabled={pendingId === challenge.id}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition disabled:opacity-60 ${
                      isCompleted
                        ? "border-cap-blue bg-cap-blue/10"
                        : "border-cap-dark-blue/15 bg-white hover:border-cap-blue/40"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="font-semibold text-cap-dark-blue">{challenge.title}</span>
                      <span className="shrink-0 rounded-full bg-cap-light-blue/15 px-2.5 py-0.5 text-xs font-bold text-cap-blue">
                        {challenge.points} pts
                      </span>
                    </div>
                    {challenge.description && (
                      <p className="text-sm text-cap-dark-blue/60">{challenge.description}</p>
                    )}
                    <span
                      className={`mt-1 text-xs font-semibold ${
                        isCompleted ? "text-cap-blue" : "text-cap-dark-blue/40"
                      }`}
                    >
                      {isCompleted ? "✓ Completed" : "Tap to mark complete"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
