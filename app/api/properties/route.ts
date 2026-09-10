import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { propertyCreateSchema } from "@/lib/validation";

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

/** Public: list available properties, with optional city/type filters. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const properties = await prisma.property.findMany({
    where: {
      status: "AVAILABLE",
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(type ? { type: type as any } : {}),
    },
    // Public, unauthenticated endpoint — never expose owner email here.
    // Contact-the-owner should go through an authenticated route/inbox instead.
    include: { images: true, owner: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ properties });
}

/** Agents, property owners, and admins can list a new property. Starts as DRAFT. */
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
