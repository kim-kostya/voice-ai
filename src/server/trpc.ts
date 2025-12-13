import { auth, currentUser } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import superjson from "superjson";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function createContext() {
  return {
    auth: await auth(),
    user: await currentUser(),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  db.transaction(async (_) => {
    const regUserCount = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.id, ctx.auth.userId as string));

    if (regUserCount[0].value < 1) {
      await db.insert(users).values({
        id: ctx.auth.userId as string,
      });
    }
  });

  return next({
    ctx: {
      auth: ctx.auth,
      user: ctx.user,
    },
  });
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(isAuthed);
