"use client";

import { useEffect, useRef, useState } from "react";

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
    <div className="flex flex-col rounded-2xl border border-brand-200 bg-white">
      <div className="flex items-center justify-between border-b border-brand-200/60 px-5 py-4">
        <div>
          {conversation.property ? (
            <p className="font-display text-base text-brand-900">{conversation.property.title}</p>
          ) : (
            <p className="font-display text-base text-brand-900">General inquiry</p>
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
            <button onClick={toggleStatus} className="text-xs text-brand-700 underline hover:text-brand-900">
              {conversation.status === "OPEN" ? "Mark resolved" : "Reopen"}
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto px-5 py-4">
        {conversation.messages.map((m) => {
          const fromMe = m.sender.id === currentUserId;
          const fromAdmin = m.sender.role === "SUPER_ADMIN";
          return (
            <div key={m.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  fromMe ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-900"
                }`}
              >
                {!fromMe && (
                  <p className="mb-1 text-xs font-medium text-brand-700">
                    {fromAdmin ? "Terraço team" : m.sender.email}
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
          className="flex-1 rounded-full border border-brand-200 px-4 py-2 text-sm outline-none focus:border-brand-500"
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {error && <p className="px-4 pb-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
