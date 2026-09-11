import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { propertyCreateSchema } from "@/lib/validation";
import { expireStaleListings, defaultExpiryDate } from "@/lib/listings";

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

/** Public: list available properties, with filters for type, listing kind, city, price, bedrooms, and amenities. */
export async function GET(req: NextRequest) {
  await expireStaleListings();

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const listingKind = searchParams.get("listingKind") ?? undefined;
  const minBedrooms = searchParams.get("minBedrooms");
  const maxPrice = searchParams.get("maxPrice");
  const amenitiesParam = searchParams.get("amenities");
  const amenities = amenitiesParam ? amenitiesParam.split(",").filter(Boolean) : [];

  const properties = await prisma.property.findMany({
    where: {
      status: "AVAILABLE",
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(type ? { type: type as any } : {}),
      ...(listingKind ? { listingKind: listingKind as any } : {}),
      ...(minBedrooms ? { bedrooms: { gte: Number(minBedrooms) } } : {}),
      ...(maxPrice ? { price: { lte: Number(maxPrice) } } : {}),
      ...(amenities.length > 0 ? { amenities: { hasEvery: amenities as any } } : {}),
    },
    // Public, unauthenticated endpoint — never expose owner email here.
    // Contact-the-owner should go through an authenticated route/inbox instead.
    include: { images: true, owner: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ properties });
}

/** Agents, property owners, and admins can list a new property. Starts as PENDING_APPROVAL. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("AGENT", "PROPERTY_OWNER", "SUPER_ADMIN");

    const json = await req.json().catch(() => null);
    const parsed = propertyCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { images, ...data } = parsed.data;

    const property = await prisma.property.create({
      data: {
        ...data,
        slug: slugify(data.title),
        ownerId: user.id,
        status: "PENDING_APPROVAL",
        expiresAt: defaultExpiryDate(),
        images: { create: images.map((url, i) => ({ url, isPrimary: i === 0 })) },
      },
      include: { images: true },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

