import { RemindersView } from "@/components/RemindersView";
import { Card } from "@/components/ui/card";

export function RemindersWidget() {
  return (
    <Card className="p-4">
      <RemindersView className="flex flex-col gap-2" />
    </Card>
  );
}
