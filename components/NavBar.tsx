import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function NavBar() {
  const user = await getCurrentUser();
  const canList = user && ["AGENT", "PROPERTY_OWNER", "SUPER_ADMIN"].includes(user.role);

  return (
    <header className="border-b border-brand-200/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-tight text-brand-900">
          Terraço
        </Link>
        <nav className="flex items-center gap-6">
          {user?.role === "SUPER_ADMIN" && (
            <Link href="/admin" className="text-sm text-brand-700 hover:text-brand-900">
              Admin
            </Link>
          )}
          {canList && (
            <Link href="/list-property" className="text-sm text-brand-700 hover:text-brand-900">
              List a property
            </Link>
          )}
          {user ? (
            <>
              <Link href="/dashboard/messages" className="text-sm text-brand-700 hover:text-brand-900">
                Messages
              </Link>
              <Link href="/dashboard" className="text-sm text-brand-700 hover:text-brand-900">
                My reservations
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-brand-700 hover:text-brand-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
