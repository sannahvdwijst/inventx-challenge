"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/photo";
import { setStoredParticipant } from "@/lib/participant";
import { Department } from "@/lib/types";

const DEPARTMENTS: Department[] = ["Domains", "Invent"];
const AVATAR_BUCKET = "challenge-photos";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

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

    let avatarUrl: string | null = null;
    if (avatarFile) {
      try {
        const compressed = await compressImage(avatarFile);
        const path = `avatars/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, compressed, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        avatarUrl = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
      } catch {
        setLoading(false);
        setError("Couldn't upload your photo. Please try again.");
        return;
      }
    }

    const { data, error: insertError } = await supabase
      .from("participants")
      .insert({
        name: trimmedName,
        team: team.trim() || null,
        department,
        avatar_url: avatarUrl,
      })
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
      <div className="flex flex-col items-center gap-2">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarSelected}
        />
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-cap-light-blue/40 bg-white/5 text-2xl transition hover:border-cap-light-blue/70"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="Your profile photo" className="h-full w-full object-cover" />
          ) : (
            "📷"
          )}
        </button>
        <span className="text-xs text-white/50">
          Add a profile photo <span className="text-white/30">(optional)</span>
        </span>
      </div>

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
