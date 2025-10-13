import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { User } from "@/server/index";

export async function createContext(user: User) {
  return {
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return opts.next({
      ctx: {
        user: ctx.user,
      },
    });
  },
);
