import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/");

  const [userCount, propertyCount, pendingCount, activeHolds, confirmed, openConversations] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.reservation.count({ where: { status: "HOLD_PENDING_PAYMENT" } }),
    prisma.reservation.count({ where: { status: "CONFIRMED" } }),
    prisma.conversation.count({ where: { status: "OPEN" } }),
  ]);

  const stats = [
    { label: "Users", value: userCount },
    { label: "Listings", value: propertyCount },
    { label: "Pending approval", value: pendingCount },
    { label: "Active holds", value: activeHolds },
    { label: "Confirmed reservations", value: confirmed },
    { label: "Open messages", value: openConversations },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900">Admin</h1>
      <p className="mt-1 text-sm text-brand-700">Platform-wide overview.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-brand-200 bg-white p-4">
            <p className="text-2xl font-display text-brand-900">{s.value}</p>
            <p className="mt-1 text-xs text-brand-700">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/admin/listings" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm text-white hover:bg-brand-700">
          Manage listings
        </Link>
        <Link href="/admin/users" className="rounded-full border border-brand-200 px-5 py-2.5 text-sm text-brand-700 hover:bg-brand-50">
          Manage users
        </Link>
        <Link href="/admin/messages" className="rounded-full border border-brand-200 px-5 py-2.5 text-sm text-brand-700 hover:bg-brand-50">
          Messages
        </Link>
      </div>

      {pendingCount > 0 && (
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {pendingCount} listing{pendingCount > 1 ? "s" : ""} waiting for approval.
        </p>
      )}
    </div>
  );
}
