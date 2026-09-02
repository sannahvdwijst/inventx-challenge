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
import { CoverflowCarousel } from "@/components/CoverflowCarousel";
import { VideoBackground } from "@/components/VideoBackground";

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

async function uploadPhotoToStorage(participantId: string, challengeId: string, file: File) {
  const compressed = await compressImage(file);
  const path = `${participantId}/${challengeId}-${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, compressed, { contentType: "image/jpeg" });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export default function ChallengesPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<StoredParticipant | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<Map<string, Completion>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [textDrafts, setTextDrafts] = useState<Record<string, string>>({});
  const [stagedFiles, setStagedFiles] = useState<Record<string, File>>({});

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const earnedBadgeIdsRef = useRef<Set<string> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingChallengeRef = useRef<Challenge | null>(null);

  useEffect(() => {
    const stored = getStoredParticipant();
    if (!stored) {
      router.replace("/join");
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

  function startFilePick(challenge: Challenge) {
    if (!participant || busyId) return;
    pendingChallengeRef.current = challenge;
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const challenge = pendingChallengeRef.current;
    pendingChallengeRef.current = null;
    if (!file || !challenge || !participant) return;

    if (challenge.proof_type === "both") {
      // Stage the file — actual submit happens once the text is filled in too.
      setStagedFiles((prev) => ({ ...prev, [challenge.id]: file }));
      return;
    }

    setBusyId(challenge.id);
    setError(null);
    try {
      const photoUrl = await uploadPhotoToStorage(participant.id, challenge.id, file);
      const { data: completion, error: insertError } = await supabase
        .from("completions")
        .insert({ participant_id: participant.id, challenge_id: challenge.id, photo_url: photoUrl })
        .select()
        .single();
      if (insertError) throw insertError;

      setCompletions((prev) => new Map(prev).set(challenge.id, completion as Completion));
      fireConfetti(70);
    } catch {
      setError("Couldn't upload that photo. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function completeTextChallenge(challenge: Challenge) {
    if (!participant || busyId) return;
    const text = (textDrafts[challenge.id] ?? "").trim();
    if (!text) {
      setError("Please fill in the text before completing this challenge.");
      return;
    }

    setBusyId(challenge.id);
    setError(null);
    try {
      const { data: completion, error: insertError } = await supabase
        .from("completions")
        .insert({ participant_id: participant.id, challenge_id: challenge.id, proof_text: text })
        .select()
        .single();
      if (insertError) throw insertError;

      setCompletions((prev) => new Map(prev).set(challenge.id, completion as Completion));
      setTextDrafts((prev) => {
        const next = { ...prev };
        delete next[challenge.id];
        return next;
      });
      fireConfetti(70);
    } catch {
      setError("Couldn't save that. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function completeBothChallenge(challenge: Challenge) {
    if (!participant || busyId) return;
    const text = (textDrafts[challenge.id] ?? "").trim();
    const file = stagedFiles[challenge.id];
    if (!text || !file) {
      setError("Please add both the text and a photo before completing this challenge.");
      return;
    }

    setBusyId(challenge.id);
    setError(null);
    try {
      const photoUrl = await uploadPhotoToStorage(participant.id, challenge.id, file);
      const { data: completion, error: insertError } = await supabase
        .from("completions")
        .insert({
          participant_id: participant.id,
          challenge_id: challenge.id,
          photo_url: photoUrl,
          proof_text: text,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      setCompletions((prev) => new Map(prev).set(challenge.id, completion as Completion));
      setTextDrafts((prev) => {
        const next = { ...prev };
        delete next[challenge.id];
        return next;
      });
      setStagedFiles((prev) => {
        const next = { ...prev };
        delete next[challenge.id];
        return next;
      });
      fireConfetti(70);
    } catch {
      setError("Couldn't save that. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeCompletion(challenge: Challenge) {
    if (!participant || busyId) return;
    const completion = completions.get(challenge.id);
    if (!completion) return;
    if (!window.confirm("Remove this completed challenge?")) return;

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
      <div className="min-h-screen">
        <VideoBackground />
        <div className="mx-auto max-w-5xl px-4 py-16 text-center text-white/60">
          Loading challenges...
        </div>
      </div>
    );
  }

  const progress = challenges.length ? completions.size / challenges.length : 0;

  function renderCard(challenge: Challenge, isActive: boolean) {
    const completion = completions.get(challenge.id);
    const isBusy = busyId === challenge.id;
    const stagedFile = stagedFiles[challenge.id];

    return (
      <div
        className={`flex h-full w-full flex-col gap-2 overflow-y-auto rounded-2xl border bg-cap-dark-blue/70 p-4 text-left shadow-sm backdrop-blur-sm transition-colors duration-300 ${
          completion ? "border-cap-light-blue/40" : "border-white/10"
        } ${isActive ? "ring-2 ring-cap-light-blue/30" : ""}`}
      >
        <div className="flex w-full items-start justify-between gap-2">
          <span className="font-semibold text-white">{challenge.title}</span>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white">
            {challenge.points} pts
          </span>
        </div>
        {challenge.description && (
          <p className="line-clamp-3 text-sm text-white/60">{challenge.description}</p>
        )}

        {completion ? (
          <div className="mt-1 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {completion.photo_url && (
                <a href={completion.photo_url} target="_blank" rel="noreferrer" className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={completion.photo_url}
                    alt={`Evidence for ${challenge.title}`}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </a>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-cap-light-blue">
                  ✓ Completed
                </span>
                <button
                  onClick={() => removeCompletion(challenge)}
                  disabled={isBusy}
                  className="text-left text-xs text-white/50 underline hover:text-red-400 disabled:opacity-50"
                >
                  {isBusy ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
            {completion.proof_text && (
              <p className="whitespace-pre-wrap rounded-lg bg-white/5 p-2 text-xs text-white/70">
                {completion.proof_text}
              </p>
            )}
          </div>
        ) : challenge.proof_type === "photo" ? (
          <button
            onClick={() => startFilePick(challenge)}
            disabled={isBusy}
            className="mt-1 rounded-lg border border-dashed border-cap-light-blue/40 px-3 py-2 text-sm font-semibold text-cap-light-blue hover:opacity-80 disabled:opacity-50"
          >
            {isBusy ? "Uploading…" : "📷 Add photo to complete"}
          </button>
        ) : challenge.proof_type === "text" ? (
          <div className="mt-1 flex flex-col gap-2">
            <textarea
              value={textDrafts[challenge.id] ?? ""}
              onChange={(e) =>
                setTextDrafts((prev) => ({ ...prev, [challenge.id]: e.target.value }))
              }
              disabled={isBusy}
              rows={2}
              placeholder="Type your answer here..."
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-cap-light-blue focus:ring-2 focus:ring-cap-light-blue/20"
            />
            <button
              onClick={() => completeTextChallenge(challenge)}
              disabled={isBusy}
              className="rounded-lg bg-cap-light-blue px-3 py-2 text-sm font-semibold text-cap-dark-blue hover:opacity-90 disabled:opacity-50"
            >
              {isBusy ? "Saving…" : "✅ Submit to complete"}
            </button>
          </div>
        ) : (
          <div className="mt-1 flex flex-col gap-2">
            <textarea
              value={textDrafts[challenge.id] ?? ""}
              onChange={(e) =>
                setTextDrafts((prev) => ({ ...prev, [challenge.id]: e.target.value }))
              }
              disabled={isBusy}
              rows={2}
              placeholder="Type your answer here..."
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-cap-light-blue focus:ring-2 focus:ring-cap-light-blue/20"
            />
            <button
              onClick={() => startFilePick(challenge)}
              disabled={isBusy}
              className="rounded-lg border border-dashed border-cap-light-blue/40 px-3 py-2 text-sm font-semibold text-cap-light-blue hover:opacity-80 disabled:opacity-50"
            >
              {stagedFile ? `📷 ${stagedFile.name}` : "📷 Attach a photo"}
            </button>
            <button
              onClick={() => completeBothChallenge(challenge)}
              disabled={isBusy || !stagedFile || !(textDrafts[challenge.id] ?? "").trim()}
              className="rounded-lg bg-cap-light-blue px-3 py-2 text-sm font-semibold text-cap-dark-blue hover:opacity-90 disabled:opacity-50"
            >
              {isBusy ? "Saving…" : "✅ Submit to complete"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const availableCategories = CATEGORY_ORDER.filter((cat) => grouped.has(cat));
  const activeCategory =
    selectedCategory && availableCategories.includes(selectedCategory)
      ? selectedCategory
      : availableCategories[0];
  const activeChallenges = activeCategory ? grouped.get(activeCategory)! : [];

  return (
    <div className="min-h-screen">
      <VideoBackground />
      <div className="mx-auto max-w-5xl px-4 py-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      <BadgeToast badges={newBadges} />

      <div className="sticky top-[49px] z-30 mb-5 rounded-2xl bg-cap-dark-blue/90 text-white shadow-lg backdrop-blur-md sm:top-[53px] sm:mb-8">
        <div className="p-4 sm:p-6">
          <p className="text-xs text-white/70 sm:text-sm">Welcome, {participant.name}</p>
          <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3 sm:mt-2 sm:gap-4">
            <div>
              <p className="text-2xl font-bold sm:text-3xl">{totalScore} pts</p>
              <p className="text-xs text-white/70 sm:text-sm">
                {completions.size} / {challenges.length} challenges completed
              </p>
            </div>
            <div className="w-full max-w-xs sm:w-56">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20 sm:h-2.5">
                <div
                  className="h-full rounded-full bg-cap-light-blue transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 sm:mt-4 sm:pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              Badges
            </p>
            <BadgeShelf earned={earnedBadges} />
          </div>
        </div>

        <div className="border-t border-white/10 px-3 pt-2 sm:px-4 sm:pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            Challenge Categories
          </p>
        </div>
        <div className="scroll-thin flex gap-2 overflow-x-auto px-3 pb-2 sm:px-4 sm:pb-3">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:text-sm ${
                category === activeCategory
                  ? "bg-white text-cap-dark-blue"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {CATEGORY_LABELS[category]}
              <span className="ml-1.5 text-[10px] opacity-70 sm:text-xs">
                {grouped.get(category)!.filter((c) => completions.has(c.id)).length}/
                {grouped.get(category)!.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 sm:mb-8">
        <Disclaimer />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {activeCategory && (
        <CoverflowCarousel
          key={activeCategory}
          items={activeChallenges}
          keyExtractor={(challenge) => challenge.id}
          ariaLabel={`${CATEGORY_LABELS[activeCategory]} challenges`}
          renderItem={(challenge, { isActive }) => renderCard(challenge, isActive)}
        />
      )}
      </div>
    </div>
  );
}
