"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLocale } from "./LocaleProvider";

const TYPE_VALUES = ["", "APARTMENT", "HOUSE", "VILLA", "LAND", "COMMERCIAL"] as const;
const TYPE_ENGLISH_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  VILLA: "Villa",
  LAND: "Land",
  COMMERCIAL: "Commercial",
};

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
  const { dict } = useLocale();
  const t = dict.filters;

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
        className="flex w-full items-center justify-between px-4 py-3.5 text-start"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-brand-900 dark:text-cream">
          {t.title}
          {activeCount > 0 && <span className="pill pill-active !px-2 !py-0.5">{activeCount}</span>}
        </span>
        <svg
          className={`h-4 w-4 text-brand-700 dark:text-honey-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M5.25 7.5L10 12.25l4.75-4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <form onSubmit={applyFilters} className="border-t border-brand-200/60 p-4 pt-4 dark:border-brand-800">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <input placeholder={t.city} value={city} onChange={(e) => setCity(e.target.value)} className="field" />
            <select value={listingKind} onChange={(e) => setListingKind(e.target.value)} className="field">
              <option value="">{t.saleOrRent}</option>
              <option value="SALE">{t.forSale}</option>
              <option value="RENT">{t.forRent}</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="field">
              {TYPE_VALUES.map((v) => (
                <option key={v} value={v}>
                  {v === "" ? t.anyType : TYPE_ENGLISH_LABELS[v]}
                </option>
              ))}
            </select>
            <select value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} className="field">
              <option value="">{t.anyBedrooms}</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+ {t.bedroomsPlus}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder={t.maxPrice}
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
              {t.apply}
            </button>
            {activeCount > 0 && (
              <button type="button" onClick={clearFilters} className="btn-ghost">
                {t.clear}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
