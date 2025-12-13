import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  currentVoice: text("current_voice"),
});

export const reminders = sqliteTable("reminders", {
  id: int("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  text: text("text").notNull(),
  time: text("time").notNull(),
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: int("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  endpoint: text("endpoint").unique().notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
});
