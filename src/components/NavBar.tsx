"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ResponaLogo from "./ResponaLogo";

export default function NavBar() {
  const pathname = usePathname();
  const link = (href: string, active = "text-blue-400") =>
    `text-gray-200 hover:text-blue-400 transition-colors ${
      pathname === href ? `font-semibold ${active}` : ""
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4 bg-black border-b border-gray-800 shadow-md">
      {/* left: logo links to home */}
      <Link href="/" className="flex items-center">
        <ResponaLogo size={28} animated className="text-white" />
      </Link>

      {/* right: links */}
      <div className="flex gap-8 text-lg">
        <Link href="/login" className={link("/login")}>Login</Link>
        <Link href="/signup" className={link("/signup")}>Sign Up</Link>
        <Link href="/premium" className={link("/premium","text-yellow-400")}>Premium</Link>
      </div>
    </nav>
  );
}
