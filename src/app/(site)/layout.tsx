import Link from "next/link";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-cap-dark-blue/90 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3 sm:px-4">
          <Link href="/challenges" className="shrink-0 text-base font-bold text-white sm:text-lg">
            Invent<span className="text-cap-light-blue">X</span>
            <span className="hidden sm:inline"> Challenge</span>
          </Link>
          <div className="flex gap-2.5 text-xs font-medium text-white/70 sm:gap-4 sm:text-sm">
            <Link href="/challenges" className="hover:text-cap-light-blue">
              Challenges
            </Link>
            <Link href="/gallery" className="hover:text-cap-light-blue">
              Gallery
            </Link>
            <Link href="/leaderboard" className="hover:text-cap-light-blue">
              Leaderboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-cap-navy text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-white/80">
          <p className="font-semibold text-white">Play fair.</p>
          <p className="mt-1">
            By marking a challenge as completed you confirm that you actually completed it.
            Please take a photo as evidence for every challenge. Winners may be asked to
            provide evidence before prizes are awarded.
          </p>
        </div>
      </footer>
    </>
  );
}
