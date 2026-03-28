"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="w-full border-b bg-white px-6 py-3 flex justify-between items-center">

      {/* LEFT — LOGO (CLICKABLE) */}
      <Link href="/" className="font-bold text-lg">
        Simpliwork OS
      </Link>

      {/* RIGHT — USER + LOGOUT */}
      <div className="flex items-center gap-4 text-sm">

        {user && (
          <div className="text-gray-600">
            {user.full_name} ({user.role})
          </div>
        )}

        <button
          onClick={handleLogout}
          className="text-red-600 font-medium"
        >
          Logout
        </button>

      </div>
    </div>
  );
}
