import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, "10 m"),
  analytics: true,
  prefix: "rl:ip:",
});

export type RateLimitResult = Awaited<ReturnType<typeof ratelimit.limit>>;

export async function limitByIp(ip: string) {
  // key already namespaced with prefix above
  return await ratelimit.limit(ip);
}
