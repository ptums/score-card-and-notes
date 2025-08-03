import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Score Card and Notes",
  description: "Golf score tracking and notes app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans bg-amber-50 text-slate-950">{children}</body>
      </html>
    </ClerkProvider>
  );
}
