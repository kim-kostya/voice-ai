import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const protectedRouter = createTRPCRouter({
  hello: protectedProcedure.query(({ ctx }) => {
    const user = ctx.user;
    return {
      secret: `${user.id} is using a protected procedure`,
    };
  }),
});

export type ProtectedRouter = typeof protectedRouter;
