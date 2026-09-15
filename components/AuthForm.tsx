"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";
import { useLocale } from "./LocaleProvider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.auth;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER_TENANT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "register" ? { email, password, role } : { email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!data) throw new Error("Server error — please try again in a moment");
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">{t.email}</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
      </div>
      <div>
        <label className="field-label">{t.password}</label>
        <input
          type="password"
          required
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={mode === "register" ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
        {mode === "register" && (
          <p className="mt-1 text-xs text-brand-700/70 dark:text-honey-white/60">{t.passwordHint}</p>
        )}
      </div>
      {mode === "register" && (
        <div>
          <label className="field-label">{t.role}</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="field">
            <option value="BUYER_TENANT">{t.buyer}</option>
            <option value="PROPERTY_OWNER">{t.owner}</option>
            <option value="AGENT">{t.agent}</option>
          </select>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading && <Spinner />}
        {mode === "login" ? t.signIn : t.createAccount}
      </button>
    </form>
  );
}
