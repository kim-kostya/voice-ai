"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/index";

export const api = createTRPCReact<AppRouter>();
