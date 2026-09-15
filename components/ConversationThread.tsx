"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "./Spinner";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; role: string; email: string };
};

type ConversationData = {
  id: string;
  status: "OPEN" | "CLOSED";
  property: { id: string; title: string; slug: string } | null;
  buyer: { id: string; email: string };
  messages: Message[];
};

export function ConversationThread({
  conversationId,
  currentUserId,
  isAdmin,
}: {
  conversationId: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/conversations/${conversationId}`);
    if (res.ok) {
      const data = await res.json();
      setConversation(data.conversation);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send message");
      setBody("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  async function toggleStatus() {
    if (!conversation) return;
    const nextStatus = conversation.status === "OPEN" ? "CLOSED" : "OPEN";
    const res = await fetch(`/api/admin/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) await load();
  }

  if (!conversation) {
    return <p className="text-sm text-brand-700">Loading…</p>;
  }

  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between border-b border-brand-200/60 px-5 py-4">
        <div>
          {conversation.property ? (
            <p className="font-display text-base text-brand-900 dark:text-cream">{conversation.property.title}</p>
          ) : (
            <p className="font-display text-base text-brand-900 dark:text-cream">General inquiry</p>
          )}
          {isAdmin && <p className="mt-0.5 text-xs text-brand-700">{conversation.buyer.email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              conversation.status === "OPEN" ? "bg-brand-100 text-brand-700" : "bg-brand-50 text-brand-700/70"
            }`}
          >
            {conversation.status === "OPEN" ? "Open" : "Closed"}
          </span>
          {isAdmin && (
            <button onClick={toggleStatus} className="text-xs text-brand-700 underline hover:text-brand-900 dark:text-cream">
              {conversation.status === "OPEN" ? "Mark resolved" : "Reopen"}
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto px-5 py-4">
        {conversation.messages.map((m) => {
          const fromMe = m.sender.id === currentUserId;
          const isStaffReply = m.sender.role === "SUPER_ADMIN" || m.sender.role === "AGENT" || m.sender.role === "PROPERTY_OWNER";
          return (
            <div key={m.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  fromMe ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-900 dark:text-cream"
                }`}
              >
                {!fromMe && (
                  <p className="mb-1 text-xs font-medium text-brand-700">
                    {isStaffReply ? "Terraco team" : m.sender.email}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-brand-200/60 px-4 py-3">
        <input
          className="field flex-1 !rounded-full !py-2"
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit" disabled={sending || !body.trim()} className="btn-primary !px-4 !py-2">
          {sending && <Spinner className="h-3.5 w-3.5" />}
          Send
        </button>
      </form>
      {error && <p className="px-4 pb-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
