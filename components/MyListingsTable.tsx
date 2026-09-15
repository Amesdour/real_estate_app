"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "./Spinner";

type MyProperty = {
  id: string;
  title: string;
  slug: string;
  status: string;
  _count: { reservations: number; conversations: number };
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-brand-50 text-brand-700",
  PENDING_APPROVAL: "bg-amber-50 text-amber-800",
  AVAILABLE: "bg-brand-100 text-brand-700",
  RESERVED: "bg-amber-50 text-amber-800",
  SOLD: "bg-brand-100 text-brand-700",
  RENTED: "bg-brand-100 text-brand-700",
  EXPIRED: "bg-brand-50 text-brand-700/70",
};

export function MyListingsTable() {
  const [properties, setProperties] = useState<MyProperty[] | null>(null);

  useEffect(() => {
    fetch("/api/my-properties")
      .then((r) => r.json())
      .then((data) => setProperties(data.properties ?? []));
  }, []);

  if (!properties) {
    return (
      <div className="flex items-center gap-2 text-brand-700 dark:text-honey-white">
        <Spinner className="h-4 w-4" />
        Loading…
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="card border-dashed p-12 text-center text-brand-700 dark:text-honey-white">
        You haven't listed anything yet.{" "}
        <Link href="/list-property" className="text-brand-900 underline dark:text-cream">
          List a property
        </Link>
        .
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {properties.map((p) => (
        <li key={p.id} className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link href={`/properties/${p.slug}`} className="font-display text-lg text-brand-900 hover:underline dark:text-cream">
                {p.title}
              </Link>
              <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">
                {p._count.reservations} reservation{p._count.reservations !== 1 && "s"} ·{" "}
                {p._count.conversations} message{p._count.conversations !== 1 && "s"}
              </p>
            </div>
            <span className={`pill ${statusColors[p.status] ?? "bg-brand-50 text-brand-700"}`}>
              {p.status.replace(/_/g, " ")}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
