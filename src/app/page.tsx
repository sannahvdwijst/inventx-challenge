import Link from "next/link";

export default function SplashPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-between overflow-hidden bg-cap-dark-blue px-4 py-10 text-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(18,26,56,0.35) 0%, rgba(18,26,56,0.55) 55%, rgba(18,26,56,0.92) 100%), url('/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <p className="pt-6 text-sm font-semibold tracking-wide text-white/70">
        Invent<span className="text-cap-light-blue">X</span> Challenge
      </p>

      <div className="flex flex-col items-center gap-6">
        <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cap-light-blue">
          The day starts now
        </span>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
          Are you ready to explore, connect, and earn your spot on the leaderboard?
        </h1>
        <p className="max-w-md text-sm text-white/70 sm:text-base">
          Challenges, teamwork, and a few surprises are waiting for you.
        </p>

        <Link
          href="/join"
          className="mt-4 rounded-full bg-cap-light-blue px-8 py-3 text-lg font-bold text-cap-dark-blue shadow-lg transition hover:scale-105 hover:bg-white active:scale-95"
        >
          Let&apos;s go!
        </Link>
      </div>

      <p className="pb-4 text-xs text-white/40">Capgemini Invent</p>
    </div>
  );
}
