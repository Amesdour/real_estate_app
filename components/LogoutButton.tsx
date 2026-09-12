"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ label = "Sign out" }: { label?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-brand-700 hover:text-brand-900 transition-colors dark:text-brand-200 dark:hover:text-brand-50"
    >
      {label}
    </button>
  );
}
