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
        <span className="mb-1 block text-sm font-medium text-cap-dark-blue">Department</span>
        <div className="grid grid-cols-2 gap-3">
          {DEPARTMENTS.map((dep) => (
            <label
              key={dep}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                department === dep
                  ? "border-cap-blue bg-cap-blue/10 text-cap-blue"
                  : "border-cap-dark-blue/20 text-cap-dark-blue hover:border-cap-blue/40"
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
