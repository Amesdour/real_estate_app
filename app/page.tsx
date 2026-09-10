import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";

export const dynamic = "force-dynamic";

function formatPrice(price: unknown) {
  const n = Number(price);
  return n > 0
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
    : "Contact for rent";
}

export default async function HomePage() {
  const properties = await prisma.property.findMany({
    where: { status: "AVAILABLE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl leading-tight text-brand-900">
          A place is only yours once you've held it.
        </h1>
        <p className="mt-4 text-brand-700">
          Browse listings, then put down a small reservation fee to hold a property
          for {" "}
          <strong className="font-medium text-brand-900">15 minutes</strong> while
          you finish the paperwork.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-brand-700">
          No properties are listed yet. Run <code className="rounded bg-brand-100 px-1.5 py-0.5">npm run seed</code> to
          add some demo listings, or sign in as an agent to list one.
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              slug={p.slug}
              title={p.title}
              city={p.city}
              country={p.country}
              type={p.type}
              price={formatPrice(p.price)}
              imageUrl={p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
