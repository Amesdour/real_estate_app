"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../Spinner";
import Link from "next/link";
import { formatDA } from "@/lib/currency";

type AdminProperty = {
  id: string;
  slug: string;
  title: string;
  city: string;
  status: string;
  price: string;
  owner: { email: string };
  reservations: { id: string }[];
};

const STATUSES = ["DRAFT", "PENDING_APPROVAL", "AVAILABLE", "RESERVED", "SOLD", "RENTED"];

export function AdminListingsTable() {
  const [properties, setProperties] = useState<AdminProperty[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/properties");
    const data = await res.json();
    if (res.ok) setProperties(data.properties);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
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

  async function remove(id: string) {
    if (!confirm("Delete this listing permanently?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  if (!properties) return <div className="flex items-center gap-2 text-brand-700 dark:text-honey-white"><Spinner className="h-4 w-4" />Loading…</div>;

  return (
    <div>
      {error && <p className="field-error mb-4">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-brand-200 text-xs text-brand-700 dark:text-honey-white">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reservations</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-brand-100 last:border-0">
                <td className="p-3">
                  <Link href={`/properties/${p.slug}`} className="text-brand-900 dark:text-cream hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-brand-700 dark:text-honey-white">{p.city}</p>
                </td>
                <td className="p-3 text-brand-700 dark:text-honey-white">{p.owner.email}</td>
                <td className="p-3 text-brand-700 dark:text-honey-white">{formatDA(p.price)}</td>
                <td className="p-3">
                  <select
                    value={p.status}
                    disabled={busyId === p.id}
                    onChange={(e) => setStatus(p.id, e.target.value)}
                    className="rounded-lg border border-brand-200 px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-brand-700 dark:text-honey-white">{p.reservations.length}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/listings/${p.id}/edit`} className="text-xs text-brand-700 dark:text-honey-white hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => remove(p.id)}
                      disabled={busyId === p.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
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
