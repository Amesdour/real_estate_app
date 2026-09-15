import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";
import { FilterBar } from "@/components/FilterBar";
import { formatDA } from "@/lib/currency";
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDictionary, isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type SearchParams = {
  city?: string;
  type?: string;
  listingKind?: string;
  minBedrooms?: string;
  maxPrice?: string;
  amenities?: string;
};

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const amenities = searchParams.amenities?.split(",").filter(Boolean) ?? [];
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale).home;

  const properties = await prisma.property.findMany({
    where: {
      status: "AVAILABLE",
      ...(searchParams.city ? { city: { equals: searchParams.city, mode: "insensitive" } } : {}),
      ...(searchParams.type ? { type: searchParams.type as any } : {}),
      ...(searchParams.listingKind ? { listingKind: searchParams.listingKind as any } : {}),
      ...(searchParams.minBedrooms ? { bedrooms: { gte: Number(searchParams.minBedrooms) } } : {}),
      ...(searchParams.maxPrice ? { price: { lte: Number(searchParams.maxPrice) } } : {}),
      ...(amenities.length > 0 ? { amenities: { hasEvery: amenities as any } } : {}),
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  const hasFilters = Object.values(searchParams).some(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl leading-tight text-brand-900 dark:text-cream">{t.title}</h1>
        <p className="mt-4 text-brand-700 dark:text-honey-white">{t.subtitle}</p>
      </div>

      <div className="mt-8">
        <FilterBar />
      </div>

      {properties.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-brand-700 dark:text-honey-white dark:border-brand-700 dark:text-honey-white">
          {hasFilters ? (
            t.empty
          ) : (
            <>No properties are listed yet. Run <code className="rounded bg-brand-100 px-1.5 py-0.5 dark:bg-brand-800">npm run seed</code> to add some demo listings, or sign in as an agent to list one.</>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              slug={p.slug}
              title={p.title}
              city={p.city}
              country={p.country}
              type={p.type}
              listingKind={p.listingKind}
              bedrooms={p.bedrooms}
              price={formatDA(p.price)}
              imageUrl={p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
