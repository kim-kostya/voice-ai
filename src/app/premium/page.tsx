export default function PremiumPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center">
      <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
      <p className="text-gray-300 max-w-md mb-8">
        Unlock advanced features, priority AI responses, and early access to new tools.
      </p>
      <button className="bg-white text-black py-2 px-6 rounded hover:bg-gray-200">
        Get Premium
      </button>
    </main>
  );
}
