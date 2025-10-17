import { Settings } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-600 rounded-full" />
          <span className="text-sm text-muted-foreground">Voice Ready</span>
        </div>
      </div>
    </header>
  );
}
