"use client";

import { useState } from "react";

export default function GoogleSettingsPage() {
  const [accessToken, _setAccessToken] = useState<string | null>(null);

  const googleUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?client_id=" +
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID +
    "&redirect_uri=" +
    encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL || "") +
    "&response_type=code" +
    "&scope=" +
    encodeURIComponent("https://www.googleapis.com/auth/calendar");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Google Calendar Integration</h1>

      <a href={googleUrl}>
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
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
        </div>
      )}
    </div>
  );
}
