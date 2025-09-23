import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server'; // Import your root AppRouter type

// Create the tRPC React client
export const trpc = createTRPCReact<AppRouter>();

// Function to determine the base URL for tRPC calls
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use a relative path
    return '';
  }
  // If in a Vercel deployment, use VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Otherwise, assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
  return `${getBaseUrl()}/api/trpc`;
}