import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server";
import { createContext } from "@/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
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

export const GET = handler;
export const POST = handler;
