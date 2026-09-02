import { Category } from "@/lib/types";

export type Badge = {
  id: string;
  emoji: string;
  label: string;
  description: string;
};

const SCORE_TIERS: { minScore: number; badge: Badge }[] = [
  {
    minScore: 0,
    badge: {
      id: "first-challenge",
      emoji: "🎮",
      label: "The Game Is On!",
      description: "Complete your first challenge",
    },
  },
  {
    minScore: 50,
    badge: { id: "50pts", emoji: "🥉", label: "Junior Challenger", description: "Reach 50 points" },
  },
  {
    minScore: 100,
    badge: { id: "100pts", emoji: "🥈", label: "Senior Challenger", description: "Reach 100 points" },
  },
  {
    minScore: 200,
    badge: { id: "200pts", emoji: "🥇", label: "Master Challenger", description: "Reach 200 points" },
  },
  {
    minScore: 350,
    badge: { id: "350pts", emoji: "🔥", label: "InventX Veteran", description: "Reach 350 points" },
  },
  {
    minScore: 500,
    badge: { id: "500pts", emoji: "👑", label: "Challenge Royalty", description: "Reach 500 points" },
  },
];

const CATEGORY_BADGES: Record<Category, Badge> = {
  networking: {
    id: "cat-networking",
    emoji: "🤝",
    label: "Networking Ninja",
    description: "Complete every Networking challenge",
  },
  fun_social: {
    id: "cat-fun_social",
    emoji: "🎉",
    label: "Life of the Party",
    description: "Complete every Fun & Social challenge",
  },
  photo: {
    id: "cat-photo",
    emoji: "📸",
    label: "Shutterbug",
    description: "Complete every Photo challenge",
  },
  party: {
    id: "cat-party",
    emoji: "🕺",
    label: "Party Legend",
    description: "Complete every Party challenge",
  },
  bonus: {
    id: "cat-bonus",
    emoji: "🎯",
    label: "Bonus Hunter",
    description: "Complete every Bonus challenge",
  },
};

const END_BOSS_BADGE: Badge = {
  id: "end-boss",
  emoji: "👹",
  label: "InventX End Boss",
  description: "Complete every challenge",
};

export function allBadges(): Badge[] {
  return [
    ...SCORE_TIERS.map((t) => t.badge),
    ...Object.values(CATEGORY_BADGES),
    END_BOSS_BADGE,
  ];
}

export function computeEarnedBadges(params: {
  totalScore: number;
  completedCount: number;
  totalChallenges: number;
  completedCountByCategory: Partial<Record<Category, number>>;
  totalCountByCategory: Partial<Record<Category, number>>;
}): Badge[] {
  const { totalScore, completedCount, totalChallenges, completedCountByCategory, totalCountByCategory } =
    params;
  const earned: Badge[] = [];

  if (completedCount >= 1) earned.push(SCORE_TIERS[0].badge);
  for (const tier of SCORE_TIERS.slice(1)) {
    if (totalScore >= tier.minScore) earned.push(tier.badge);
  }

  for (const category of Object.keys(CATEGORY_BADGES) as Category[]) {
    const total = totalCountByCategory[category] ?? 0;
    const done = completedCountByCategory[category] ?? 0;
    if (total > 0 && done >= total) earned.push(CATEGORY_BADGES[category]);
  }

  if (totalChallenges > 0 && completedCount >= totalChallenges) earned.push(END_BOSS_BADGE);

  return earned;
}
