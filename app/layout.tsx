import type { Metadata } from "next";
// import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Your Golf Buddy",
  description: "Golf score tracking and notes app",
  manifest: "/manifest.json",
  themeColor: "#F97316",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Your Golf Buddy",
  },
  icons: {
    icon: [
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favicon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Your Golf Buddy" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans bg-amber-50 text-slate-950">
        <Header />
        <main className="pt-0">{children}</main>
        <SpeedInsights />
      </body>
    </html>
  );
}
