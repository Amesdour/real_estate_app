import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ReservationPanel } from "@/components/ReservationPanel";

export const dynamic = "force-dynamic";

function formatPrice(price: unknown) {
  const n = Number(price);
  return n > 0
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
    : "Contact for rent";
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const [property, user] = await Promise.all([
    prisma.property.findUnique({
      where: { slug: params.slug },
      include: { images: true, owner: { select: { email: true } } },
    }),
    getCurrentUser(),
  ]);

  if (!property) notFound();

  const attributes = (property.attributes ?? {}) as Record<string, unknown>;
  const primaryImage = property.images.find((i) => i.isPrimary)?.url ?? property.images[0]?.url;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-brand-100">
            {primaryImage && <Image src={primaryImage} alt={property.title} fill className="object-cover" />}
          </div>

          <h1 className="mt-8 font-display text-3xl text-brand-900">{property.title}</h1>
          <p className="mt-1 text-brand-700">
            {property.address}, {property.city}, {property.country}
          </p>
          <p className="mt-6 whitespace-pre-line text-brand-900/90">{property.description}</p>

          {Object.keys(attributes).length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-brand-200 pt-6 sm:grid-cols-3">
              {Object.entries(attributes).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-brand-700">{key}</dt>
                  <dd className="text-sm text-brand-900">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-8 text-sm text-brand-700">Listed by {property.owner.email}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-200 bg-white p-6">
            <p className="font-display text-2xl text-brand-900">{formatPrice(property.price)}</p>
            <p className="mt-1 text-sm text-brand-700 capitalize">{property.status.toLowerCase().replace("_", " ")}</p>
          </div>
          <ReservationPanel
            propertyId={property.id}
            propertyStatus={property.status}
            reservationFee={Number(property.reservationFee)}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </div>
  );
}
