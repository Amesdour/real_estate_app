"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "../Spinner";

type UploadedImage = { url: string; uploading?: boolean; name: string };

const AMENITY_LABELS: Record<string, string> = {
  POOL: "Pool",
  GARAGE: "Garage",
  GARDEN: "Garden",
  AIR_CONDITIONING: "A/C",
  ELEVATOR: "Elevator",
  FURNISHED: "Furnished",
  BALCONY: "Balcony",
  SECURITY: "Security",
  PARKING: "Parking",
  INTERNET: "Internet",
};

const STATUSES = ["DRAFT", "PENDING_APPROVAL", "AVAILABLE", "RESERVED", "SOLD", "RENTED", "EXPIRED"];

export function AdminEditListingForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/properties/${propertyId}`);
      const data = await res.json().catch(() => null);
      if (!data) {
        setError("Server error — please try again in a moment");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not load listing");
        setLoading(false);
        return;
      }
      const p = data.property;
      setForm({
        title: p.title,
        description: p.description,
        type: p.type,
        listingKind: p.listingKind,
        status: p.status,
        price: String(p.price),
        reservationFee: String(p.reservationFee),
        bedrooms: p.bedrooms ?? "",
        bathrooms: p.bathrooms ?? "",
        areaSqm: p.areaSqm ?? "",
        address: p.address,
        city: p.city,
        country: p.country,
        latitude: String(p.latitude),
        longitude: String(p.longitude),
        expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "",
      });
      setAmenities(p.amenities ?? []);
      setImages(p.images.map((i: { url: string }) => ({ url: i.url, name: i.url })));
      setLoading(false);
    }
    load();
  }, [propertyId]);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
    setSaved(false);
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const placeholders: UploadedImage[] = files.map((f) => ({ url: "", uploading: true, name: f.name }));
    setImages((prev) => [...prev, ...placeholders]);

    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setImages((prev) =>
          prev.map((img) => (img.name === file.name && img.uploading ? { url: data.url, name: file.name } : img))
        );
      } catch (err) {
        setImages((prev) => prev.filter((img) => !(img.name === file.name && img.uploading)));
        setError(err instanceof Error ? err.message : `Could not upload ${file.name}`);
      }
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img.url !== url));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          type: form.type,
          listingKind: form.listingKind,
          status: form.status,
          price: Number(form.price),
          reservationFee: Number(form.reservationFee),
          bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
          areaSqm: form.areaSqm ? Number(form.areaSqm) : null,
          amenities,
          address: form.address,
          city: form.city,
          country: form.country,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
          images: images.filter((i) => !i.uploading).map((i) => i.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const fieldErrors = data.details?.fieldErrors as Record<string, string[]> | undefined;
        if (fieldErrors) {
          const first = Object.entries(fieldErrors).find(([, msgs]) => msgs?.length);
          if (first) throw new Error(`${first[0]}: ${first[1][0]}`);
        }
        throw new Error(data.error ?? "Could not save");
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-brand-700">
        <Spinner className="h-4 w-4" />
        Loading…
      </div>
    );
  }
  if (error && !form.title) return <p className="text-red-600">{error}</p>;

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="form-section">
        <p className="form-section-title">Status</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Status</label>
            <select className="field" value={form.status} onChange={(e) => update("status", e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Listing expires on</label>
            <input
              type="date"
              className="field"
              value={form.expiresAt}
              onChange={(e) => update("expiresAt", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Basics</p>
        <div>
          <label className="field-label">Title</label>
          <input required className="field" value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea
            required
            rows={4}
            className="field"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Type</label>
            <select className="field" value={form.type} onChange={(e) => update("type", e.target.value)}>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="VILLA">Villa</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
          <div>
            <label className="field-label">Sale or rent</label>
            <select
              className="field"
              value={form.listingKind}
              onChange={(e) => update("listingKind", e.target.value)}
            >
              <option value="SALE">For sale</option>
              <option value="RENT">For rent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Details</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="field-label">Bedrooms</label>
            <input
              type="number"
              min="0"
              className="field"
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Bathrooms</label>
            <input
              type="number"
              min="0"
              className="field"
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Area (m²)</label>
            <input
              type="number"
              min="0"
              className="field"
              value={form.areaSqm}
              onChange={(e) => update("areaSqm", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="field-label">Amenities</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {Object.entries(AMENITY_LABELS).map(([value, amenityLabel]) => (
              <label
                key={value}
                className={`pill cursor-pointer ${amenities.includes(value) ? "pill-active" : "pill-inactive"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={amenities.includes(value)}
                  onChange={() => toggleAmenity(value)}
                />
                {amenityLabel}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Pricing</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Price in DA (0 if for rent)</label>
            <input
              required
              type="number"
              min="0"
              className="field"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Reservation fee in DA</label>
            <input
              required
              type="number"
              min="0"
              className="field"
              value={form.reservationFee}
              onChange={(e) => update("reservationFee", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Location</p>
        <div>
          <label className="field-label">Address</label>
          <input required className="field" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">City</label>
            <input required className="field" value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Country</label>
            <input required className="field" value={form.country} onChange={(e) => update("country", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Latitude</label>
            <input
              required
              type="text"
              inputMode="decimal"
              placeholder="e.g. 36.7525"
              className="field"
              value={form.latitude}
              onChange={(e) => update("latitude", e.target.value.replace(",", "."))}
            />
          </div>
          <div>
            <label className="field-label">Longitude</label>
            <input
              required
              type="text"
              inputMode="decimal"
              placeholder="e.g. 3.042"
              className="field"
              value={form.longitude}
              onChange={(e) => update("longitude", e.target.value.replace(",", "."))}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Photos</p>
        <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-brand-300 px-3 py-6 text-sm text-brand-700 transition-colors hover:border-brand-500 hover:bg-brand-50">
          <span>Tap to add photos</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
        </label>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.url || img.name} className="relative aspect-square overflow-hidden rounded-lg bg-brand-100">
                {img.uploading ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-xs text-brand-700">
                    <Spinner className="h-4 w-4 text-brand-500" />
                    Uploading…
                  </div>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.url)}
                      aria-label="Remove photo"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || images.some((i) => i.uploading)} className="btn-primary">
          {saving && <Spinner />}
          Save changes
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-brand-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs">✓</span>
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
