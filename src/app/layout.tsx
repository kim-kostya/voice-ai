import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashGate from "../components/SplashGate";
import NavBar from "../components/NavBar"; // ✅ add this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Respona",
  description: "Find your voice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <SplashGate>
          <NavBar /> {/* ✅ your new top nav */}
          <div className="pt-20">{children}</div> {/* push content below nav */}
        </SplashGate>
      </body>
    </html>
  );
}
