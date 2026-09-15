import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MyListingsTable } from "@/components/MyListingsTable";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!["AGENT", "PROPERTY_OWNER"].includes(user.role)) redirect("/");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-brand-900 dark:text-cream">My listings</h1>
        <Link href="/list-property" className="btn-primary">
          List a property
        </Link>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <Link href="/dashboard/listings/reservations" className="btn-ghost">
          Reservations on my listings
        </Link>
        <Link href="/dashboard/listings/messages" className="btn-ghost">
          Messages about my listings
        </Link>
      </div>

      <div className="mt-8">
        <MyListingsTable />
      </div>
    </div>
  );
}
