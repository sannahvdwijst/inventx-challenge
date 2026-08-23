const STORAGE_KEY = "inventx_participant";

export type StoredParticipant = {
  id: string;
  name: string;
  team: string | null;
};

export function getStoredParticipant(): StoredParticipant | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredParticipant;
  } catch {
    return null;
  }
}

export function setStoredParticipant(participant: StoredParticipant) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(participant));
}

export function clearStoredParticipant() {
  window.localStorage.removeItem(STORAGE_KEY);
}
