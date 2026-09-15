"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReservationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "confirm" | "cancel") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${id}/${action}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (status !== "HOLD_PENDING_PAYMENT") return null;

  return (
    <div className="mt-3">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => act("confirm")}
          disabled={loading}
          className="rounded-full bg-brand-600 px-4 py-1.5 text-xs text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Confirm reservation
        </button>
        <button
          onClick={() => act("cancel")}
          disabled={loading}
          className="rounded-full border border-brand-200 px-4 py-1.5 text-xs text-brand-700 dark:text-honey-white hover:bg-brand-50 disabled:opacity-50"
        >
          Cancel hold
        </button>
      </div>
    </div>
  );
}
