"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../Spinner";

type AdminUser = {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  _count: { properties: number; reservations: number };
};

const ROLES = ["SUPER_ADMIN", "AGENT", "PROPERTY_OWNER", "BUYER_TENANT"];

export function AdminUsersTable({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(id: string, role: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update role");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  if (!users) return <div className="flex items-center gap-2 text-brand-700"><Spinner className="h-4 w-4" />Loading…</div>;

  return (
    <div>
      {error && <p className="field-error mb-4">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-brand-200 text-xs text-brand-700">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Listings</th>
              <th className="p-3">Reservations</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-brand-100 last:border-0">
                <td className="p-3 text-brand-900 dark:text-cream">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={busyId === u.id || u.id === currentUserId}
                    onChange={(e) => setRole(u.id, e.target.value)}
                    className="rounded-lg border border-brand-200 px-2 py-1 text-xs disabled:opacity-50"
                    title={u.id === currentUserId ? "You can't change your own role" : undefined}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-brand-700">{u._count.properties}</td>
                <td className="p-3 text-brand-700">{u._count.reservations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
