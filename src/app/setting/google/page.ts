"use client";

import { useSearchParams } from "next/navigation";
import { GOOGLE_CALENDAR_SCOPES } from "@/server/google/scopes";

export default function GoogleSettingsPage() {
  const params = useSearchParams();
  const accessToken = params.get("accessToken") || "";

  const googleUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}` +
    "&response_type=code&access_type=offline&prompt=consent" +
    "&scope=" +
    encodeURIComponent(GOOGLE_CALENDAR_SCOPES.join(" "));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Google Calendar Integration</h1>

      <a href={googleUrl}>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Connect Google Calendar
        </button>
      </a>

      {accessToken && (
        <div className="mt-4">
          <h2 className="font-medium">Access Token (debug)</h2>
          <textarea
            className="w-full border p-2 text-xs"
            rows={4}
            defaultValue={accessToken}
          />
          <p className="text-sm text-gray-500">
            Later you should store this token in database, not in URL.
          </p>
        </div>
      )}
    </div>
  );
}
