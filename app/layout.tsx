import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/Headers";
import { BottomNav } from "@/components/BottomNav";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookBazar - Buy & Sell Second-Hand Books",
  description: "Find affordable textbooks from your seniors or sell your old books to juniors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(174, 72%, 56%)",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <BottomNav />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}