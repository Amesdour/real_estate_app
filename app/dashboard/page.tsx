import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expireStaleHolds } from "@/lib/reservations";
import { ReservationActions } from "@/components/ReservationActions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  HOLD_PENDING_PAYMENT: "Hold pending payment",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  COMPLETED: "Completed",
};

const statusColors: Record<string, string> = {
  HOLD_PENDING_PAYMENT: "bg-amber-50 text-amber-800",
  CONFIRMED: "bg-brand-100 text-brand-700",
  CANCELLED: "bg-brand-50 text-brand-700",
  EXPIRED: "bg-brand-50 text-brand-700",
  COMPLETED: "bg-brand-100 text-brand-700",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await expireStaleHolds();

  const reservations = await prisma.reservation.findMany({
    where: { buyerId: user.id },
    include: { property: { include: { images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900">My reservations</h1>

      {reservations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-brand-700">
          You haven't placed any holds yet.{" "}
          <Link href="/" className="text-brand-900 underline">
            Browse listings
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {reservations.map((r) => (
            <li key={r.id} className="rounded-2xl border border-brand-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/properties/${r.property.slug}`} className="font-display text-lg text-brand-900 hover:underline">
                    {r.property.title}
                  </Link>
                  <p className="mt-1 text-sm text-brand-700">
                    {r.property.city}, {r.property.country}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${statusColors[r.status] ?? "bg-brand-50 text-brand-700"}`}>
                  {statusLabels[r.status] ?? r.status}
                </span>
              </div>
              <ReservationActions id={r.id} status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
