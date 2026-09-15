"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDA } from "@/lib/currency";
import { Spinner } from "./Spinner";

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
      <div className="card p-6">
        <p className="text-brand-700 dark:text-honey-white">
          <a href="/login" className="text-brand-900 dark:text-cream underline">
            Sign in
          </a>{" "}
          to place a hold on this property.
        </p>
      </div>
    );
  }

  if (reservation?.status === "CONFIRMED") {
    return (
      <div className="card p-6">
        <p className="font-medium text-brand-900 dark:text-cream">Reservation confirmed</p>
        <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">
          The property is held for you. An agent will follow up to arrange next steps.
        </p>
      </div>
    );
  }

  if (reservation?.status === "HOLD_PENDING_PAYMENT") {
    return (
      <div className="card p-6">
        <p className="font-medium text-brand-900 dark:text-cream">Hold placed</p>
        <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">
          {secondsLeft !== null && secondsLeft > 0
            ? `This hold expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}.`
            : "This hold has expired."}
        </p>
        {error && <p className="field-error mt-3">{error}</p>}
        <div className="mt-4 flex gap-3">
          <button onClick={confirmReservation} disabled={loading || secondsLeft === 0} className="btn-primary">
            {loading && <Spinner />}
            Confirm reservation
          </button>
          <button onClick={cancelReservation} disabled={loading} className="btn-secondary">
            Cancel hold
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <p className="font-display text-lg text-brand-900 dark:text-cream">
        Reservation fee: {formatDA(reservationFee)}
      </p>
      <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">
        Placing a hold reserves this property for 15 minutes so no one else can take it while you confirm.
      </p>
      {error && <p className="field-error mt-3">{error}</p>}
      <button
        onClick={placeHold}
        disabled={loading || propertyStatus !== "AVAILABLE"}
        className="btn-primary mt-4 w-full sm:w-auto"
      >
        {loading && <Spinner />}
        {propertyStatus === "AVAILABLE" ? "Place a 15-minute hold" : "Currently unavailable"}
      </button>
    </div>
  );
}
