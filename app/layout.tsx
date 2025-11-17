import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phase 10 - Multiplayer Card Game",
  description: "Real-time multiplayer Phase 10 card game built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
