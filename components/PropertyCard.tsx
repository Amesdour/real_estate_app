import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDictionary, isLocale } from "@/lib/i18n";

type Props = {
  slug: string;
  title: string;
  city: string;
  country: string;
  price: string;
  type: string;
  listingKind?: string;
  bedrooms?: number | null;
  imageUrl?: string;
};

const typeLabels: Record<string, string> = {
  LAND: "Land",
  HOUSE: "House",
  APARTMENT: "Apartment",
  COMMERCIAL: "Commercial",
  VILLA: "Villa",
};

export function PropertyCard({ slug, title, city, country, price, type, listingKind, bedrooms, imageUrl }: Props) {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale).property;

  return (
    <Link href={`/properties/${slug}`} className="card card-interactive group block overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100 dark:bg-brand-800">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* start-3/end-3 (logical) instead of left-3/right-3 so these badges
            swap sides automatically under dir="rtl" instead of both sitting
            on the visual left in Arabic. */}
        <span className="absolute start-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-brand-700 dark:text-honey-white backdrop-blur-sm">
          {typeLabels[type] ?? type}
        </span>
        {listingKind && (
          <span className="absolute end-3 top-3 rounded-full bg-brand-900/85 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {listingKind === "RENT" ? t.forRent : t.forSale}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate font-display text-lg text-brand-900 dark:text-cream">{title}</h3>
        <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">
          {city}, {country}
          {typeof bedrooms === "number" && ` · ${bedrooms} ${t.bedroomsShort}`}
        </p>
        <p className="mt-2 font-display text-lg text-brand-900 dark:text-cream">{price}</p>
      </div>
    </Link>
  );
}
