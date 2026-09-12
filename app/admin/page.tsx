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
    { label: "Users", value: userCount, href: "/admin/users" },
    { label: "Listings", value: propertyCount, href: "/admin/listings" },
    { label: "Pending approval", value: pendingCount, href: "/admin/listings" },
    { label: "Active holds", value: activeHolds, href: "/admin/reservations" },
    { label: "Confirmed reservations", value: confirmed, href: "/admin/reservations" },
    { label: "Open messages", value: openConversations, href: "/admin/messages" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900">Admin</h1>
      <p className="mt-1 text-sm text-brand-700">Platform-wide overview.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card card-interactive block p-4">
            <p className="font-display text-2xl text-brand-900">{s.value}</p>
            <p className="mt-1 text-xs text-brand-700">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/listings" className="btn-primary">
          Manage listings
        </Link>
        <Link href="/admin/users" className="btn-secondary">
          Manage users
        </Link>
        <Link href="/admin/reservations" className="btn-secondary">
          Reservations
        </Link>
        <Link href="/admin/messages" className="btn-secondary">
          Messages
        </Link>
      </div>

      {pendingCount > 0 && (
        <Link
          href="/admin/listings"
          className="mt-6 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 transition-colors hover:bg-amber-100"
        >
          <span aria-hidden="true">●</span>
          {pendingCount} listing{pendingCount > 1 ? "s" : ""} waiting for approval — review now
        </Link>
      )}
    </div>
  );
}
