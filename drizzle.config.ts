import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

if (!process.env.DATABASE_AUTH_TOKEN) {
  throw new Error("DATABASE_AUTH_TOKEN is not defined");
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
