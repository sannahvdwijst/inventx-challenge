"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setStoredParticipant } from "@/lib/participant";
import { Department } from "@/lib/types";

const DEPARTMENTS: Department[] = ["Domains", "Invent"];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!department) {
      setError("Please select your department.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("participants")
      .insert({ name: trimmedName, team: team.trim() || null, department })
      .select()
      .single();

    setLoading(false);

    if (insertError || !data) {
      setError("Something went wrong registering you. Please try again.");
      return;
    }

    setStoredParticipant({
      id: data.id,
      name: data.name,
      team: data.team,
      department: data.department,
    });
    router.push("/challenges");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-white/80">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-cap-light-blue focus:ring-2 focus:ring-cap-light-blue/20"
          required
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-white/80">Department</span>
        <div className="grid grid-cols-2 gap-3">
          {DEPARTMENTS.map((dep) => (
            <label
              key={dep}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                department === dep
                  ? "border-cap-light-blue bg-cap-light-blue/10 text-cap-light-blue"
                  : "border-white/20 text-white/70 hover:border-cap-light-blue/40"
              }`}
            >
              <input
                type="radio"
                name="department"
                value={dep}
                checked={department === dep}
                onChange={() => setDepartment(dep)}
                className="sr-only"
                required
              />
              {dep}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="team" className="mb-1 block text-sm font-medium text-white/80">
          Team / domain <span className="font-normal text-white/40">(optional)</span>
        </label>
        <input
          id="team"
          type="text"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="e.g. Data & AI"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-cap-light-blue focus:ring-2 focus:ring-cap-light-blue/20"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-cap-light-blue px-4 py-2.5 font-semibold text-cap-dark-blue transition hover:bg-white disabled:opacity-60"
      >
        {loading ? "Joining..." : "Join the Challenge"}
      </button>
    </form>
  );
}
