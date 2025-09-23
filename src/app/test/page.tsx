"use client";

import { trpc } from "@/lib/trpc";

export default function Home() {
  const {
    data: helloData,
    isLoading,
    error,
  } = trpc.example.hello.useQuery({ text: "Client" });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Next.js + tRPC App Router</h1>
      <p className="text-xl">{helloData?.greeting}</p>
    </main>
  );
}
