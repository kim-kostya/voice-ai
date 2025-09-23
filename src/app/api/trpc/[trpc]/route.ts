import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server";
import { createContext } from "@/server/trpc";
import { limitByIp } from "@/server/ratelimit";

function getClientIp(req: Request): string {
  const headers = req.headers;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    // Could be a list: client, proxy1, proxy2
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }
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
  // As a last resort, use the user-agent as a very weak key to avoid nulls
  return headers.get("user-agent") ?? "unknown";
}

const handler = async (req: Request) => {
  const ip = getClientIp(req);
  try {
    const rl = await limitByIp(ip);
    if (!rl.success) {
      const retryAfterSec = Math.max(0, Math.ceil((rl.reset - Date.now()) / 1000));
      return new Response(
        JSON.stringify({ error: "Too Many Requests", message: "Rate limit exceeded" }),
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

    const res = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => {
        return createContext();
      },
      onError({ error, path }) {
        console.error("tRPC error", { path, error });
      },
    });

    // Attach rate limit headers for visibility
    try {
      res.headers.set("X-RateLimit-Limit", String(rl.limit));
      res.headers.set("X-RateLimit-Remaining", String(Math.max(0, rl.remaining)));
      res.headers.set("X-RateLimit-Reset", String(rl.reset));
    } catch {}

    return res;
  } catch (e) {
    // If ratelimit fails (e.g., missing env), do not block API but log error
    console.error("Rate limit check failed", e);
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => {
        return createContext();
      },
      onError({ error, path }) {
        console.error("tRPC error", { path, error });
      },
    });
  }
};

export const GET = handler;
export const POST = handler;
