import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ReservationPanel } from "@/components/ReservationPanel";
import { ContactPlatformForm } from "@/components/ContactPlatformForm";
import { formatDA } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const [property, user] = await Promise.all([
    prisma.property.findUnique({
      where: { slug: params.slug },
      // Never select owner.email here — it would render straight into the
      // page's HTML for any visitor. All contact goes through the platform
      // via ContactPlatformForm, not directly to the owner/agent.
      include: { images: true },
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

          {property.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {property.images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-brand-100">
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

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
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-200 bg-white p-6">
            <p className="font-display text-2xl text-brand-900">{formatDA(property.price)}</p>
            <p className="mt-1 text-sm text-brand-700 capitalize">{property.status.toLowerCase().replace("_", " ")}</p>
          </div>
          <ReservationPanel
            propertyId={property.id}
            propertyStatus={property.status}
            reservationFee={Number(property.reservationFee)}
            isLoggedIn={!!user}
          />
          <ContactPlatformForm propertyId={property.id} isLoggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}
