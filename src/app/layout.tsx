import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
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
      <body className="min-h-full flex flex-col bg-cap-white text-cap-dark-blue">{children}</body>
    </html>
  );
}
