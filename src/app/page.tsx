import { RegisterForm } from "@/components/RegisterForm";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="bg-stars mt-6 flex flex-col items-center gap-5 rounded-3xl px-6 py-16 text-center sm:py-20">
        <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-cap-light-blue">
          🚀 AI · Networking · Learning · Collaboration
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Welcome to the Invent<span className="text-cap-light-blue">X</span> Challenge
        </h1>
        <div className="gradient-bar h-1.5 w-28 rounded-full" />
        <p className="max-w-2xl text-lg text-white/70">
          A bingo card, scavenger hunt, and networking challenge all in one. Complete
          challenges throughout the day, earn points, and climb the leaderboard.
        </p>
      </section>

      <section className="flex flex-col items-center gap-6 py-12">
        <RegisterForm />
        <div className="w-full max-w-sm">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
