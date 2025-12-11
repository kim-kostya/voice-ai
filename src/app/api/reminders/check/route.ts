import { eq, sql } from "drizzle-orm";
import type { PushNotification } from "@/lib/push";
import { db } from "@/server/db";
import { reminders } from "@/server/db/schema";
import { sendPushNotification } from "@/server/push";

export async function POST(): Promise<Response> {
  const pastReminders = await db
    .select()
    .from(reminders)
    .where(sql`datetime(${reminders.time}) <= datetime('now', 'utc')`);

  for (const pastReminder of pastReminders) {
    try {
      const payload: PushNotification = {
        type: "reminder",
        reminderId: pastReminder.id,
        textContent: pastReminder.text,
      };

      await sendPushNotification(payload, pastReminder.authorId);

      await db.delete(reminders).where(eq(reminders.id, pastReminder.id));
    } catch (e) {
      console.warn("Failed to send push notification:", e);
    }
  }

  return new Response(JSON.stringify(pastReminders), { status: 200 });
}
