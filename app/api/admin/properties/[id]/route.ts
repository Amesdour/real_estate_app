import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { propertyUpdateSchema } from "@/lib/validation";

/** Fetch a single property (any status) for the admin edit form. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ property });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

/**
 * Full edit for a listing: any field can be updated, including its status
 * (approve/reject/archive) and — if `images` is included in the body — a
 * full replacement of its photo gallery.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");

    const json = await req.json().catch(() => null);
    const parsed = propertyUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { images, expiresAt, ...rest } = parsed.data;

    const property = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.propertyImage.deleteMany({ where: { propertyId: params.id } });
      }
      return tx.property.update({
        where: { id: params.id },
        data: {
          ...rest,
          ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
          ...(images
            ? { images: { create: images.map((url, i) => ({ url, isPrimary: i === 0 })) } }
            : {}),
        },
        include: { images: true },
      });
    });

    return NextResponse.json({ property });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * Deletes a listing outright. Refuses if it has any reservation history
 * (even old/cancelled ones) so admins don't silently destroy an audit trail —
 * archiving via status is the intended path for a listing that's had activity.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");

    const reservationCount = await prisma.reservation.count({
      where: { propertyId: params.id },
    });
    if (reservationCount > 0) {
      return NextResponse.json(
        {
          error:
            "This listing has reservation history and can't be deleted. Set its status instead to archive it.",
        },
        { status: 409 }
      );
    }

    await prisma.property.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
