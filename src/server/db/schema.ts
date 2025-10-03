import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reminders = sqliteTable("reminders", {
  id: int("id").primaryKey(),
  authorId: int("author_id").notNull(),
  text: text("text").notNull(),
});
