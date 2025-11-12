import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { appRouter, type User } from "@/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { limitByIp } from "@/server/ratelimit";
import { createContext } from "@/server/trpc";

function getClientIp(req: Request): string {
  const headers = req.headers;
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";

  const candidates = [
    "cf-connecting-ip",
    "x-real-ip",
    "x-client-ip",
    "fastly-client-ip",
    "true-client-ip",
    "x-cluster-client-ip",
  ];
  for (const h of candidates) {
    const val = headers.get(h);
    if (val) return val;
  }

  return headers.get("user-agent") ?? "unknown";
}

async function getUser(): Promise<User> {
  const requestCookies = await cookies();
  const userIdentifier = requestCookies.get("userId")?.value;

  if (!userIdentifier) {
    throw new Error("UserId is not set.");
  }

  const userDbResult = await db
    .select()
    .from(users)
    .where(eq(users.id, userIdentifier))
    .limit(1)
    .execute();

  if (userDbResult.length === 0) {
    await db.insert(users).values({ id: userIdentifier }).execute();
  }

  return { id: userIdentifier };
}

async function handler(req: Request) {
  const ip = getClientIp(req);
  const user = await getUser();

  try {
    const rl = await limitByIp(ip);

    if (!rl.success) {
      const retryAfterSec = Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000));
      return new Response(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded",
        }),
        {
          status: 429,
          headers: {
            "content-type": "application/json",
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Limit": String(rl.limit),
            "X-RateLimit-Remaining": String(Math.max(0, rl.remaining)),
            "X-RateLimit-Reset": String(rl.reset),
          },
        },
      );
    }

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => createContext(user),
      onError({ error, path }) {
        console.error("tRPC error:", { path, error });
      },
    });
    try {
      response.headers.set("X-RateLimit-Limit", String(rl.limit));
      response.headers.set("X-RateLimit-Remaining", String(Math.max(0, rl.remaining)));
      response.headers.set("X-RateLimit-Reset", String(rl.reset));
    } catch {
      // FIX for "Empty block statement. (no-empty)":
    }

    return response;
  } catch (e) {
    console.error("Rate limit check failed:", e);
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => createContext(user),
      onError({ error, path }) {
        console.error("tRPC error:", { path, error });
      },
    });
  }
}

export { handler as GET, handler as POST };