import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Computational Science — Tech Fest",
  description: "Multi-round CS quiz and coding contest platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <Nav />
        <main className="mx-auto max-w-4xl px-4 pb-16 pt-8">{children}</main>
      </body>
    </html>
  );
}
