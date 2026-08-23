"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setStoredParticipant } from "@/lib/participant";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("participants")
      .insert({ name: trimmedName, team: team.trim() || null })
      .select()
      .single();

    setLoading(false);

    if (insertError || !data) {
      setError("Something went wrong registering you. Please try again.");
      return;
    }

    setStoredParticipant({ id: data.id, name: data.name, team: data.team });
    router.push("/challenges");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-cap-dark-blue">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-cap-dark-blue/20 px-4 py-2.5 text-cap-dark-blue outline-none focus:border-cap-blue focus:ring-2 focus:ring-cap-blue/20"
          required
        />
      </div>
      <div>
        <label htmlFor="team" className="mb-1 block text-sm font-medium text-cap-dark-blue">
          Team / domain <span className="font-normal text-cap-dark-blue/50">(optional)</span>
        </label>
        <input
          id="team"
          type="text"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="e.g. Data & AI"
          className="w-full rounded-lg border border-cap-dark-blue/20 px-4 py-2.5 text-cap-dark-blue outline-none focus:border-cap-blue focus:ring-2 focus:ring-cap-blue/20"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-cap-blue px-4 py-2.5 font-semibold text-white transition hover:bg-cap-dark-blue disabled:opacity-60"
      >
        {loading ? "Joining..." : "Join the Challenge"}
      </button>
    </form>
  );
}
