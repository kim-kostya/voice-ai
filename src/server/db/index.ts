import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

if (!process.env.DATABASE_AUTH_TOKEN) {
  throw new Error("DATABASE_AUTH_TOKEN is not defined");
}

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
