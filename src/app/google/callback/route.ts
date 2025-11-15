import { NextResponse } from "next/server";
import { createOAuthClient } from "@/server/google/client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const oauth = createOAuthClient();
  const { tokens } = await oauth.getToken(code);

  // TODO: save tokens in DB or Clerk metadata
  const params = new URLSearchParams();
  if (tokens.access_token) {
    params.set("accessToken", tokens.access_token);
  }

  return NextResponse.redirect(`/setting/google?${params.toString()}`);
}
