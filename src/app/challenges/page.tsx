"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/photo";
import { getStoredParticipant, StoredParticipant } from "@/lib/participant";
import { CATEGORY_LABELS, Category, Challenge, Completion } from "@/lib/types";
import { Badge, computeEarnedBadges } from "@/lib/badges";
import { Disclaimer } from "@/components/Disclaimer";
import { BadgeShelf } from "@/components/BadgeShelf";
import { BadgeToast } from "@/components/BadgeToast";

function fireConfetti(particleCount: number) {
  confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#0058AB", "#1DB8F2", "#121A38"],
  });
}

const CATEGORY_ORDER: Category[] = ["networking", "fun_social", "photo", "party", "bonus"];
const PHOTO_BUCKET = "challenge-photos";

function storagePathFromUrl(url: string) {
  const marker = `/object/public/${PHOTO_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export default function ChallengesPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<StoredParticipant | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<Map<string, Completion>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const earnedBadgeIdsRef = useRef<Set<string> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingChallengeRef = useRef<Challenge | null>(null);

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
        supabase.from("completions").select("*").eq("participant_id", participant!.id),
      ]);

      setChallenges((challengeData as Challenge[]) ?? []);
      const map = new Map<string, Completion>();
      for (const c of (completionData as Completion[]) ?? []) {
        map.set(c.challenge_id, c);
      }
      setCompletions(map);
      setLoading(false);
    }

    load();
  }, [participant]);

  const totalScore = useMemo(
    () =>
      challenges
        .filter((c) => completions.has(c.id))
        .reduce((sum, c) => sum + c.points, 0),
    [challenges, completions]
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

  const earnedBadges = useMemo(() => {
    const totalCountByCategory: Partial<Record<Category, number>> = {};
    const completedCountByCategory: Partial<Record<Category, number>> = {};
    for (const c of challenges) {
      totalCountByCategory[c.category] = (totalCountByCategory[c.category] ?? 0) + 1;
      if (completions.has(c.id)) {
        completedCountByCategory[c.category] = (completedCountByCategory[c.category] ?? 0) + 1;
      }
    }
    return computeEarnedBadges({
      totalScore,
      completedCount: completions.size,
      totalChallenges: challenges.length,
      completedCountByCategory,
      totalCountByCategory,
    });
  }, [challenges, completions, totalScore]);

  useEffect(() => {
    if (challenges.length === 0) return;
    const currentIds = new Set(earnedBadges.map((b) => b.id));

    if (earnedBadgeIdsRef.current === null) {
      // First computation after data loads — these are pre-existing badges,
      // not newly unlocked ones, so don't celebrate them.
      earnedBadgeIdsRef.current = currentIds;
      return;
    }

    const freshlyEarned = earnedBadges.filter((b) => !earnedBadgeIdsRef.current!.has(b.id));
    earnedBadgeIdsRef.current = currentIds;

    if (freshlyEarned.length > 0) {
      setNewBadges(freshlyEarned);
      fireConfetti(freshlyEarned.length > 1 ? 220 : 140);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setNewBadges([]), 3200);
    }
  }, [earnedBadges, challenges.length]);

  function startUpload(challenge: Challenge) {
    if (!participant || busyId) return;
    pendingChallengeRef.current = challenge;
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const challenge = pendingChallengeRef.current;
    if (!file || !challenge || !participant) return;

    setBusyId(challenge.id);
    setError(null);

    try {
      const compressed = await compressImage(file);
      const path = `${participant.id}/${challenge.id}-${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

      const { data: completion, error: insertError } = await supabase
        .from("completions")
        .insert({
          participant_id: participant.id,
          challenge_id: challenge.id,
          photo_url: publicUrlData.publicUrl,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      setCompletions((prev) => new Map(prev).set(challenge.id, completion as Completion));
      fireConfetti(70);
    } catch {
      setError("Couldn't upload that photo. Please try again.");
    } finally {
      setBusyId(null);
      pendingChallengeRef.current = null;
    }
  }

  async function removeCompletion(challenge: Challenge) {
    if (!participant || busyId) return;
    const completion = completions.get(challenge.id);
    if (!completion) return;
    if (!window.confirm("Remove this completed challenge and its photo?")) return;

    setBusyId(challenge.id);
    setError(null);

    const { error: deleteError } = await supabase
      .from("completions")
      .delete()
      .eq("participant_id", participant.id)
      .eq("challenge_id", challenge.id);

    if (!deleteError) {
      if (completion.photo_url) {
        const path = storagePathFromUrl(completion.photo_url);
        if (path) await supabase.storage.from(PHOTO_BUCKET).remove([path]);
      }
      setCompletions((prev) => {
        const next = new Map(prev);
        next.delete(challenge.id);
        return next;
      });
    } else {
      setError("Couldn't remove that challenge. Please try again.");
    }

    setBusyId(null);
  }

  if (!participant || loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-cap-dark-blue/60">
        Loading challenges...
      </div>
    );
  }

  const progress = challenges.length ? completions.size / challenges.length : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      <BadgeToast badges={newBadges} />

      <div className="mb-8 rounded-2xl bg-cap-dark-blue p-6 text-white">
        <p className="text-sm text-white/70">Welcome, {participant.name}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-bold">{totalScore} pts</p>
            <p className="text-sm text-white/70">
              {completions.size} / {challenges.length} challenges completed
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
        <div className="mt-4 border-t border-white/10 pt-4">
          <BadgeShelf earned={earnedBadges} />
        </div>
      </div>

      <div className="mb-8">
        <Disclaimer />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-10">
        {CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((category) => (
          <section key={category}>
            <h2 className="mb-4 text-xl font-bold text-cap-dark-blue">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.get(category)!.map((challenge) => {
                const completion = completions.get(challenge.id);
                const isBusy = busyId === challenge.id;

                return (
                  <div
                    key={challenge.id}
                    className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${
                      completion
                        ? "border-cap-blue bg-cap-blue/10"
                        : "border-cap-dark-blue/15 bg-white"
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

                    {completion?.photo_url ? (
                      <div className="mt-1 flex items-center gap-3">
                        <a
                          href={completion.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={completion.photo_url}
                            alt={`Evidence for ${challenge.title}`}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        </a>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-cap-blue">✓ Completed</span>
                          <button
                            onClick={() => removeCompletion(challenge)}
                            disabled={isBusy}
                            className="text-left text-xs text-cap-dark-blue/50 underline hover:text-red-600 disabled:opacity-50"
                          >
                            {isBusy ? "Removing…" : "Remove"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startUpload(challenge)}
                        disabled={isBusy}
                        className="mt-1 rounded-lg border border-dashed border-cap-blue/40 px-3 py-2 text-sm font-semibold text-cap-blue hover:bg-cap-blue/5 disabled:opacity-50"
                      >
                        {isBusy ? "Uploading…" : "📷 Add photo to complete"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
