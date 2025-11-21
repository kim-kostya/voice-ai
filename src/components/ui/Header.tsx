import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-semibold">RESPONA</h1>

      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <Button>Sign in</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton />
          <Settings className="w-6 h-6 cursor-pointer" />
        </SignedIn>
      </div>
    </header>
  );
}
