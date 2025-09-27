const liveKitApiKey = process.env.LIVEKIT_API_KEY;
const liveKitApiSecret = process.env.LIVEKIT_API_SECRET;
const liveKitWsUrl = process.env.LIVEKIT_URL;

if (!liveKitApiKey || !liveKitApiSecret || !liveKitWsUrl)
  throw new Error("Missing LiveKit environment variables");

export { liveKitApiKey, liveKitApiSecret, liveKitWsUrl };
