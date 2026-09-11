import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminReservationsTable } from "@/components/admin/AdminReservationsTable";

export default async function AdminReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900">Manage reservations</h1>
      <p className="mt-1 text-sm text-brand-700">
        Every hold across all buyers and listings. Confirm on a buyer's behalf if they paid the
        reservation fee outside the app, or cancel/complete as needed.
      </p>
      <div className="mt-8">
        <AdminReservationsTable />
      </div>
    </div>
  );
}
