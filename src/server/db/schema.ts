import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
});

export const reminders = sqliteTable("reminders", {
  id: int("id").primaryKey({ autoIncrement: true }),
  authorId: int("author_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  time: text("time").notNull(),
});
