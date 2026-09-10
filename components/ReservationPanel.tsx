"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  propertyId: string;
  propertyStatus: string;
  reservationFee: number;
  isLoggedIn: boolean;
};

type Reservation = {
  id: string;
  status: string;
  holdExpiresAt: string;
};

export function ReservationPanel({ propertyId, propertyStatus, reservationFee, isLoggedIn }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [demoPayment, setDemoPayment] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!reservation || reservation.status !== "HOLD_PENDING_PAYMENT") return;
    const tick = () => {
      const diff = Math.max(0, new Date(reservation.holdExpiresAt).getTime() - Date.now());
      setSecondsLeft(Math.round(diff / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  async function placeHold() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place a hold");
      setReservation(data.reservation);
      setDemoPayment(data.payment?.demo ?? false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReservation() {
    if (!reservation) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not confirm");
      setReservation(data.reservation);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function cancelReservation() {
    if (!reservation) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/cancel`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not cancel");
      }
      setReservation(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-white p-6">
        <p className="text-brand-700">
          <a href="/login" className="text-brand-900 underline">
            Sign in
          </a>{" "}
          to place a hold on this property.
        </p>
      </div>
    );
  }

  if (reservation?.status === "CONFIRMED") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-white p-6">
        <p className="font-medium text-brand-900">Reservation confirmed</p>
        <p className="mt-1 text-sm text-brand-700">
          The property is held for you. An agent will follow up to arrange next steps.
        </p>
      </div>
    );
  }

  if (reservation?.status === "HOLD_PENDING_PAYMENT") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-white p-6">
        <p className="font-medium text-brand-900">Hold placed</p>
        <p className="mt-1 text-sm text-brand-700">
          {secondsLeft !== null && secondsLeft > 0
            ? `This hold expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}.`
            : "This hold has expired."}
        </p>
        {demoPayment && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Demo mode: no Stripe key is configured, so this doesn't charge a card. Confirming below
            just marks the reservation fee as paid for demonstration purposes.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-3">
          <button
            onClick={confirmReservation}
            disabled={loading || secondsLeft === 0}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {demoPayment ? "Confirm (demo payment)" : "Confirm and pay"}
          </button>
          <button
            onClick={cancelReservation}
            disabled={loading}
            className="rounded-full border border-brand-200 px-5 py-2 text-sm text-brand-700 hover:bg-brand-50 disabled:opacity-50"
          >
            Cancel hold
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-white p-6">
      <p className="font-display text-lg text-brand-900">
        Reservation fee: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(reservationFee)}
      </p>
      <p className="mt-1 text-sm text-brand-700">
        Placing a hold reserves this property for 15 minutes so no one else can take it while you confirm.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        onClick={placeHold}
        disabled={loading || propertyStatus !== "AVAILABLE"}
        className="mt-4 w-full rounded-full bg-brand-600 px-5 py-2.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50 sm:w-auto"
      >
        {propertyStatus === "AVAILABLE" ? "Place a 15-minute hold" : "Currently unavailable"}
      </button>
    </div>
  );
}
