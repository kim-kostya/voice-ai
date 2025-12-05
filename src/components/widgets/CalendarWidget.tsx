import { CalendarComponent } from "@/components/ui/CalendarComponent";
import { Card } from "@/components/ui/card";

export function CalendarWidget() {
  return (
    <Card className="p-4">
      <CalendarComponent className="flex flex-col gap-2" />
    </Card>
  );
}
