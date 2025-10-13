// middleware.ts (Next.js 13+)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const cookie = req.cookies.get("userId");
  if (!cookie) {
    const id = crypto.randomUUID();
    res.cookies.set("userId", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|assets).*)"],
};
