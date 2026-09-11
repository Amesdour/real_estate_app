"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Sends the buyer's message to the PLATFORM, not to the property's agent or
 * owner — Terraço is always the intermediary, by design. There is no field or
 * code path here that routes a message directly to an agent/owner.
 */
export function ContactPlatformForm({ propertyId, isLoggedIn }: { propertyId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-white p-6">
        <p className="text-sm text-brand-700">
          <a href="/login" className="text-brand-900 underline">
            Sign in
          </a>{" "}
          to ask the Terraço team a question about this listing.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send your message");
      router.push(`/dashboard/messages/${data.conversation.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-brand-200 bg-white p-6">
      <p className="font-display text-base text-brand-900">Ask the Terraço team</p>
      <p className="mt-1 text-xs text-brand-700">
        Questions about a listing go through our team, not directly to the agent or owner.
      </p>
      <textarea
        required
        rows={3}
        className="mt-3 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        placeholder="Is this property still available? Can I schedule a visit?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-full bg-brand-600 px-5 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Send message
      </button>
    </form>
  );
}
