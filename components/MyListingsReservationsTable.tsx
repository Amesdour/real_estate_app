"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "./Spinner";

type MyReservation = {
  id: string;
  status: string;
  createdAt: string;
  property: { title: string; slug: string };
  buyer: { email: string };
};

const statusColors: Record<string, string> = {
  HOLD_PENDING_PAYMENT: "bg-amber-50 text-amber-800",
  CONFIRMED: "bg-brand-100 text-brand-700",
  CANCELLED: "bg-brand-50 text-brand-700/70",
  EXPIRED: "bg-brand-50 text-brand-700/70",
  COMPLETED: "bg-brand-100 text-brand-700",
};

export function MyListingsReservationsTable() {
  const [reservations, setReservations] = useState<MyReservation[] | null>(null);

  useEffect(() => {
    fetch("/api/my-properties/reservations")
      .then((r) => r.json())
      .then((data) => setReservations(data.reservations ?? []));
  }, []);

  if (!reservations) {
    return (
      <div className="flex items-center gap-2 text-brand-700 dark:text-honey-white">
        <Spinner className="h-4 w-4" />
        Loading…
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="card border-dashed p-12 text-center text-brand-700 dark:text-honey-white">
        No reservations on your listings yet.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-start text-sm">
        <thead className="border-b border-brand-200 text-xs text-brand-700 dark:border-brand-800 dark:text-honey-white">
          <tr>
            <th className="p-3">Property</th>
            <th className="p-3">Buyer</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="border-b border-brand-100 last:border-0 dark:border-brand-800">
              <td className="p-3">
                <Link href={`/properties/${r.property.slug}`} className="text-brand-900 hover:underline dark:text-cream">
                  {r.property.title}
                </Link>
              </td>
              <td className="p-3 text-brand-700 dark:text-honey-white">{r.buyer.email}</td>
              <td className="p-3">
                <span className={`pill ${statusColors[r.status] ?? "bg-brand-50 text-brand-700"}`}>
                  {r.status.replace(/_/g, " ")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
