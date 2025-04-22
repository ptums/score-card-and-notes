import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Score Card & Notes",
  description: "@",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-amber-50 text-slate-950">{children}</body>
    </html>
  );
}
