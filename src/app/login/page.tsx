export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Log In</h1>
      <form className="flex flex-col gap-3 w-72">
        <input type="email" placeholder="Email" className="p-2 rounded bg-gray-800" />
        <input type="password" placeholder="Password" className="p-2 rounded bg-gray-800" />
        <button className="bg-white text-black py-2 rounded hover:bg-gray-200">Login</button>
      </form>
    </main>
  );
}
