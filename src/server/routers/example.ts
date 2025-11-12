import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure.query(({ ctx }) => {
    const user = ctx.user;

    if (!user) {
      return { greeting: "Hello! You are not signed in." };
    }

    return { greeting: `Hello ${user.id}!` };
  }),
});

export type ExampleRouter = typeof exampleRouter;
