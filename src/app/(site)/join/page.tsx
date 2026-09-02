import { RegisterForm } from "@/components/RegisterForm";
import { Disclaimer } from "@/components/Disclaimer";
import { VideoBackground } from "@/components/VideoBackground";

export default function JoinPage() {
  return (
    <div className="min-h-screen">
      <VideoBackground />
      <div className="mx-auto max-w-5xl px-4">
        <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-cap-light-blue">
            AI · Networking · Learning · Collaboration
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Welcome to the{" "}
            <span>
              Invent<span className="text-cap-light-blue">X</span>
            </span>{" "}
            Challenge
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
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
    </div>
  );
}
