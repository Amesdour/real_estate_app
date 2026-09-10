"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ListPropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "APARTMENT",
    price: "",
    reservationFee: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    imageUrl: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          type: form.type,
          price: Number(form.price),
          reservationFee: Number(form.reservationFee),
          address: form.address,
          city: form.city,
          country: form.country,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          attributes: {},
          images: form.imageUrl ? [form.imageUrl] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create listing");
      setSubmitted(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-white p-6">
        <p className="font-medium text-brand-900">Listing submitted</p>
        <p className="mt-1 text-sm text-brand-700">
          It's saved as <strong>pending approval</strong> — an admin needs to publish it before it shows
          up in the public listings.
        </p>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
  const label = "block text-sm text-brand-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={label}>Title</label>
        <input required className={field} value={form.title} onChange={(e) => update("title", e.target.value)} />
      </div>
      <div>
        <label className={label}>Description</label>
        <textarea required rows={4} className={field} value={form.description} onChange={(e) => update("description", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Type</label>
          <select className={field} value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="VILLA">Villa</option>
            <option value="LAND">Land</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <div>
          <label className={label}>Image URL</label>
          <input className={field} value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Price (0 if for rent)</label>
          <input required type="number" min="0" className={field} value={form.price} onChange={(e) => update("price", e.target.value)} />
        </div>
        <div>
          <label className={label}>Reservation fee</label>
          <input required type="number" min="0" className={field} value={form.reservationFee} onChange={(e) => update("reservationFee", e.target.value)} />
        </div>
      </div>
      <div>
        <label className={label}>Address</label>
        <input required className={field} value={form.address} onChange={(e) => update("address", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>City</label>
          <input required className={field} value={form.city} onChange={(e) => update("city", e.target.value)} />
        </div>
        <div>
          <label className={label}>Country</label>
          <input required className={field} value={form.country} onChange={(e) => update("country", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Latitude</label>
          <input required type="number" step="any" className={field} value={form.latitude} onChange={(e) => update("latitude", e.target.value)} />
        </div>
        <div>
          <label className={label}>Longitude</label>
          <input required type="number" step="any" className={field} value={form.longitude} onChange={(e) => update("longitude", e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-brand-600 px-5 py-2.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Submit listing
      </button>
    </form>
  );
}
