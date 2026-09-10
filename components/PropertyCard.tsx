import Link from "next/link";
import Image from "next/image";

type Props = {
  slug: string;
  title: string;
  city: string;
  country: string;
  price: string;
  type: string;
  imageUrl?: string;
};

const typeLabels: Record<string, string> = {
  LAND: "Land",
  HOUSE: "House",
  APARTMENT: "Apartment",
  COMMERCIAL: "Commercial",
  VILLA: "Villa",
};

export function PropertyCard({ slug, title, city, country, price, type, imageUrl }: Props) {
  return (
    <Link
      href={`/properties/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-brand-200/60 bg-white transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs text-brand-700">
          {typeLabels[type] ?? type}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-brand-900">{title}</h3>
        <p className="mt-1 text-sm text-brand-700">
          {city}, {country}
        </p>
        <p className="mt-2 text-base text-brand-900">{price}</p>
      </div>
    </Link>
  );
}
