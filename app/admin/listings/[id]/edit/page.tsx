import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminEditListingForm } from "@/components/admin/AdminEditListingForm";

export default async function AdminEditListingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900 dark:text-cream">Edit listing</h1>
      <p className="mt-1 text-sm text-brand-700">
        Full control over this listing — status, details, photos, and expiry.
      </p>
      <div className="mt-8">
        <AdminEditListingForm propertyId={params.id} />
      </div>
    </div>
  );
}
