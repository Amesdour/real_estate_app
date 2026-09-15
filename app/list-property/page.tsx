import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ListPropertyForm } from "@/components/ListPropertyForm";

export default async function ListPropertyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!["AGENT", "PROPERTY_OWNER", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900 dark:text-cream">List a property</h1>
      <p className="mt-2 text-sm text-brand-700 dark:text-honey-white">
        New listings start as pending approval and won't appear publicly until published.
      </p>
      <div className="mt-8">
        <ListPropertyForm />
      </div>
    </div>
  );
}
