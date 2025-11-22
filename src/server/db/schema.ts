import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id"),
  currentVoice: text("current_voice"),
});

export const reminders = sqliteTable("reminders", {
  id: int("id").primaryKey({ autoIncrement: true }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  time: text("time").notNull(),
});
