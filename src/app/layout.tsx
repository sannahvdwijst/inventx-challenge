import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "InventX Challenge",
  description: "The InventX Challenge — a bingo-card style scavenger hunt for networking, AI, and fun.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ubuntu.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cap-white text-cap-dark-blue">
        <header className="sticky top-0 z-40 border-b border-black/5 bg-cap-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-cap-blue">
              Invent<span className="text-cap-light-blue">X</span> Challenge
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/challenges" className="hover:text-cap-blue">
                Challenges
              </Link>
              <Link href="/leaderboard" className="hover:text-cap-blue">
                Leaderboard
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-black/5 bg-cap-dark-blue text-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-white/80">
            <p className="font-semibold text-white">Play fair.</p>
            <p className="mt-1">
              By marking a challenge as completed you confirm that you actually completed it.
              Please take a photo as evidence for every challenge. Winners may be asked to
              provide evidence before prizes are awarded.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
