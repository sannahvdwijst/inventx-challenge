import { RegisterForm } from "@/components/RegisterForm";
import { Disclaimer } from "@/components/Disclaimer";

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <span className="rounded-full bg-cap-light-blue/15 px-4 py-1 text-sm font-semibold text-cap-blue">
          AI · Networking · Learning · Collaboration
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-cap-dark-blue sm:text-6xl">
          Welcome to the{" "}
          <span className="text-cap-blue">
            Invent<span className="text-cap-light-blue">X</span>
          </span>{" "}
          Challenge
        </h1>
        <p className="max-w-2xl text-lg text-cap-dark-blue/70">
          A bingo card, scavenger hunt, and networking challenge all in one. Complete
          challenges throughout the day, earn points, and climb the leaderboard.
        </p>

        <div className="mt-6 flex w-full justify-center">
          <RegisterForm />
        </div>

        <div className="mt-4 w-full max-w-sm">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
