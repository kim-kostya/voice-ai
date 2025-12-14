import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type React from "react";
import { Suspense } from "react";
import { LiveKitRoom } from "@/components/LiveKitRoom";
import TRPCProvider from "@/components/TRPCProvider";
import { Header } from "@/components/ui/Header";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SerwistProvider } from "@/lib/serwist";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Respona - Voice AI Assistant",
  description: "Personal voice AI Assistant for routine tasks.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SerwistProvider swUrl="/serwist/sw.js">
            <div className="min-h-screen bg-background flex flex-col">
              <SignedIn>
                <TRPCProvider>
                  <Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
                        <LoadingSpinner className="w-64 h-64" />
                      </div>
                    }
                  >
                    <LiveKitRoom>
                      <Header />
                      {children}
                    </LiveKitRoom>
                  </Suspense>
                </TRPCProvider>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
                  <h1 className="text-3xl font-semibold">
                    Welcome to Voice AI
                  </h1>
                  <p className="text-gray-600">Please sign in to continue.</p>
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="bg-[#6c47ff] text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-[#5a39e6] transition"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>
          </SerwistProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
