import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-sm" />
        </div>
        <span className="text-lg font-semibold">Respona</span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
