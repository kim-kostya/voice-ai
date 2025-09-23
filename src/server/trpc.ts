import {initTRPC} from '@trpc/server';
import type {Context} from '@/server/context';
import superjson from "superjson";

const t = initTRPC.context<Context>().create({
  transformer: superjson
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
