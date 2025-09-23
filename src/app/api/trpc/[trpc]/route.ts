// src/app/api/trpc/[trpc]/route.ts
import {fetchRequestHandler} from '@trpc/server/adapters/fetch';
import {appRouter} from '@/server'; // Your root tRPC router
import {createContext} from '@/server/context'; // Your tRPC context creator

const handler = (req: Request) => fetchRequestHandler({
  endpoint: '/api/trpc',
  req,
  router: appRouter,
  createContext: async () => {
    return createContext();
  },
  onError({ error, path }) {
    console.error("tRPC error", { path, error });
  },
});

export const GET = handler;
export const POST = handler;