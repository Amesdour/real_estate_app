import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminListingsTable } from "@/components/admin/AdminListingsTable";

export default async function AdminListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900 dark:text-cream">Manage listings</h1>
      <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">
        Approve a pending listing by setting it to Available, or send it back to Draft to reject it.
      </p>
      <div className="mt-8">
        <AdminListingsTable />
      </div>
    </div>
  );
}
