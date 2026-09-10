import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { reservationCreateSchema } from "@/lib/validation";
import { expireStaleHolds, HOLD_DURATION_MINUTES } from "@/lib/reservations";
import { createPaymentIntent } from "@/lib/payments";

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
      if (property.status !== "AVAILABLE") {
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

      await tx.property.update({
        where: { id: propertyId },
        data: { status: "RESERVED" },
      });

      return { reservation, property };
    });

    // Payment intent is created outside the DB transaction since it's a network call.
    const intent = await createPaymentIntent(Number(result.property.reservationFee));

    const reservation = await prisma.reservation.update({
      where: { id: result.reservation.id },
      data: { stripeIntentId: intent.intentId },
    });

    return NextResponse.json(
      {
        reservation,
        payment: { demo: intent.demo, clientSecret: intent.clientSecret },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
