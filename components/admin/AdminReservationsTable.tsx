"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../Spinner";
import Link from "next/link";

type AdminReservation = {
  id: string;
  status: string;
  amountPaid: string;
  holdExpiresAt: string;
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

const ACTIONS: Record<string, { label: string; next: string }[]> = {
  HOLD_PENDING_PAYMENT: [
    { label: "Confirm (paid offline)", next: "CONFIRMED" },
    { label: "Cancel", next: "CANCELLED" },
  ],
  CONFIRMED: [
    { label: "Mark completed", next: "COMPLETED" },
    { label: "Cancel", next: "CANCELLED" },
  ],
};

export function AdminReservationsTable() {
  const [reservations, setReservations] = useState<AdminReservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/reservations");
    const data = await res.json();
    if (res.ok) setReservations(data.reservations);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  if (!reservations) return <div className="flex items-center gap-2 text-brand-700"><Spinner className="h-4 w-4" />Loading…</div>;

  return (
    <div>
      {error && <p className="field-error mb-4">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-200 text-xs text-brand-700">
            <tr>
              <th className="p-3">Property</th>
              <th className="p-3">Buyer</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="border-b border-brand-100 last:border-0">
                <td className="p-3">
                  <Link href={`/properties/${r.property.slug}`} className="text-brand-900 hover:underline">
                    {r.property.title}
                  </Link>
                </td>
                <td className="p-3 text-brand-700">{r.buyer.email}</td>
                <td className="p-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${statusColors[r.status] ?? "bg-brand-50 text-brand-700"}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    {(ACTIONS[r.status] ?? []).map((a) => (
                      <button
                        key={a.next}
                        onClick={() => setStatus(r.id, a.next)}
                        disabled={busyId === r.id}
                        className="text-xs text-brand-700 underline hover:text-brand-900 disabled:opacity-50"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
