import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import OfflineStatus from "@/components/OfflineStatus";
import { AuthProvider } from "@/lib/auth-context";

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
    <html lang="en">
      <body className="font-sans bg-amber-50 text-slate-950">
        <AuthProvider>
          <Header />
          <main className="pt-0">{children}</main>
          <SpeedInsights />
          <OfflineStatus />
        </AuthProvider>
      </body>
    </html>
  );
}
