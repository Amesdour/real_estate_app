import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

const statusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "PENDING_APPROVAL",
    "AVAILABLE",
    "RESERVED",
    "SOLD",
    "RENTED",
  ]),
});

/** Approve, reject (send back to DRAFT), or otherwise change a listing's status. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");

    const json = await req.json().catch(() => null);
    const parsed = statusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
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
