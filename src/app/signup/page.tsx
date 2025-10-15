export default function SignupPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      <form className="flex flex-col gap-3 w-72">
        <input type="text" placeholder="Full Name" className="p-2 rounded bg-gray-800" />
        <input type="email" placeholder="Email" className="p-2 rounded bg-gray-800" />
        <input type="password" placeholder="Password" className="p-2 rounded bg-gray-800" />
        <button className="bg-white text-black py-2 rounded hover:bg-gray-200">Create Account</button>
      </form>
    </main>
  );
}
