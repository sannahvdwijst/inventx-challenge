export type Category = "networking" | "fun_social" | "ai" | "photo" | "party" | "bonus";

export const CATEGORY_LABELS: Record<Category, string> = {
  networking: "Networking",
  fun_social: "Fun & Social",
  ai: "AI Challenges",
  photo: "Photo Challenges",
  party: "Party Challenges",
  bonus: "Bonus",
};

export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  points: number;
  created_at: string;
};

export type Participant = {
  id: string;
  name: string;
  team: string | null;
  registered_at: string;
};

export type Completion = {
  id: string;
  participant_id: string;
  challenge_id: string;
  completed_at: string;
};

export type ParticipantScore = {
  id: string;
  name: string;
  team: string | null;
  registered_at: string;
  total_score: number;
  challenges_completed: number;
};
