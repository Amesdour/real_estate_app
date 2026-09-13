"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

/**
 * Sends the buyer's message into a platform-mediated thread — it's never a
 * direct, unlogged channel to the property's agent/owner. The listing's own
 * agent/owner CAN see and reply to this specific thread (since it's about
 * their listing), and SUPER_ADMIN can see every thread, but there's no path
 * for an unrelated agent/owner to see a conversation that isn't about one of
 * their own properties.
 */
export function ContactPlatformForm({ propertyId, isLoggedIn }: { propertyId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="card p-6">
        <p className="text-sm text-brand-700">
          <a href="/login" className="text-brand-900 underline">
            Sign in
          </a>{" "}
          to ask the Terraco team a question about this listing.
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
    <form onSubmit={submit} className="card p-6">
      <p className="font-display text-base text-brand-900">Ask the Terraco team</p>
      <p className="mt-1 text-xs text-brand-700">
        Questions about a listing go through our team, not directly to the agent or owner.
      </p>
      <textarea
        required
        rows={3}
        className="field mt-3"
        placeholder="Is this property still available? Can I schedule a visit?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {error && <p className="field-error mt-2">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary mt-3">
        {loading && <Spinner />}
        Send message
      </button>
    </form>
  );
}
