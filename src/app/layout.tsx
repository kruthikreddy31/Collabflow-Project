import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "CollabFlow — Project management for fast-moving teams",
  description:
    "CollabFlow is a Trello/Notion-style collaboration tool: kanban boards, real-time sync, and analytics for your team.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
