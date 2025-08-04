import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your Golf Buddy",
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
        <body className="font-sans bg-amber-50 text-slate-950">
          <Header />
          <main className="pt-0">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
