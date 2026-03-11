import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rooster Partners - Caller System Dashboard",
  description: "Caller system dashboard for Rooster Partners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-50`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          {/* pt-14 offsets mobile top bar, pb-16 offsets mobile bottom nav */}
          <main className="flex-1 overflow-y-auto bg-gray-50 pt-14 pb-16 md:pt-0 md:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
