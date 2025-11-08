"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Header } from "@/components/ui/Header";
import { VoiceAIAgentContainer } from "@/components/VoiceAIAgentContainer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Show only when user is signed in */}
      <SignedIn>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-20">
          <div className="flex flex-col items-center gap-6 mb-8">
            <VoiceAIAgentContainer />
          </div>
        </main>
      </SignedIn>

      {/* Show when user is NOT signed in */}
      <SignedOut>
        <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
          <h1 className="text-3xl font-semibold">Welcome to Voice AI</h1>
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
  );
}
