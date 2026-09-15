import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MyListingsReservationsTable } from "@/components/MyListingsReservationsTable";

export default async function MyListingsReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!["AGENT", "PROPERTY_OWNER"].includes(user.role)) redirect("/");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900 dark:text-cream">Reservations on my listings</h1>
      <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">
        Read-only — confirming, cancelling, or completing a reservation is handled by the platform team.
      </p>
      <div className="mt-8">
        <MyListingsReservationsTable />
      </div>
    </div>
  );
}
