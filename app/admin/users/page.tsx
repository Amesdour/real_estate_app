import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900">Manage users</h1>
      <p className="mt-1 text-sm text-brand-700">Change a user's role. You can't change your own.</p>
      <div className="mt-8">
        <AdminUsersTable currentUserId={user.id} />
      </div>
    </div>
  );
}
