"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const TYPES = [
  { value: "", label: "Any type" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "VILLA", label: "Villa" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
];

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

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCount = Array.from(searchParams.keys()).length;
  const [open, setOpen] = useState(activeCount > 0);

  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [listingKind, setListingKind] = useState(searchParams.get("listingKind") ?? "");
  const [minBedrooms, setMinBedrooms] = useState(searchParams.get("minBedrooms") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [amenities, setAmenities] = useState<string[]>(
    searchParams.get("amenities")?.split(",").filter(Boolean) ?? []
  );

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (listingKind) params.set("listingKind", listingKind);
    if (minBedrooms) params.set("minBedrooms", minBedrooms);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (amenities.length > 0) params.set("amenities", amenities.join(","));
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    setCity("");
    setType("");
    setListingKind("");
    setMinBedrooms("");
    setMaxPrice("");
    setAmenities([]);
    router.push("/");
  }

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-brand-900">
          Filters
          {activeCount > 0 && <span className="pill pill-active !px-2 !py-0.5">{activeCount}</span>}
        </span>
        <svg
          className={`h-4 w-4 text-brand-700 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M5.25 7.5L10 12.25l4.75-4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <form onSubmit={applyFilters} className="border-t border-brand-200/60 p-4 pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="field" />
            <select value={listingKind} onChange={(e) => setListingKind(e.target.value)} className="field">
              <option value="">Sale or rent</option>
              <option value="SALE">For sale</option>
              <option value="RENT">For rent</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="field">
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} className="field">
              <option value="">Any bedrooms</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+ bedrooms
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Max price (DA)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="field"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
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

          <div className="mt-4 flex gap-3">
            <button type="submit" className="btn-primary">
              Apply filters
            </button>
            {activeCount > 0 && (
              <button type="button" onClick={clearFilters} className="btn-ghost">
                Clear all
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
