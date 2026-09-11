import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { reservationCreateSchema } from "@/lib/validation";
import { expireStaleHolds, HOLD_DURATION_MINUTES } from "@/lib/reservations";
import { createHoldReference } from "@/lib/reservation-reference";

/** The current user's reservations. */
export async function GET() {
  try {
    const user = await requireUser();
    await expireStaleHolds();

    const reservations = await prisma.reservation.findMany({
      where: { buyerId: user.id },
      include: { property: { include: { images: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reservations });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

/** Places a time-limited hold on a property, blocking other reservations until it expires or is confirmed/cancelled. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const json = await req.json().catch(() => null);
    const parsed = reservationCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await expireStaleHolds();

    const { propertyId } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const property = await tx.property.findUnique({ where: { id: propertyId } });
      if (!property) {
        throw new AuthError("Property not found", 404);
      }
      // Atomic check-and-set: the WHERE clause re-checks status=AVAILABLE as part
      // of the same UPDATE statement, so two concurrent requests can't both read
      // "AVAILABLE" and both win. Only the first to reach the DB flips the row;
      // the second gets updateResult.count === 0 and is rejected below. A plain
      // read-then-write here (read status, then separately update it) is NOT
      // atomic under Postgres's default Read Committed isolation and allows two
      // buyers to double-book the same property.
      const updateResult = await tx.property.updateMany({
        where: { id: propertyId, status: "AVAILABLE" },
        data: { status: "RESERVED" },
      });

      if (updateResult.count === 0) {
        throw new AuthError("This property is not available to reserve right now", 409);
      }

      const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60_000);

      const reservation = await tx.reservation.create({
        data: {
          propertyId,
          buyerId: user.id,
          status: "HOLD_PENDING_PAYMENT",
          holdExpiresAt,
          amountPaid: 0,
        },
      });

      return { reservation, property };
    });

    const reservation = await prisma.reservation.update({
      where: { id: result.reservation.id },
      data: { holdReference: createHoldReference() },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
