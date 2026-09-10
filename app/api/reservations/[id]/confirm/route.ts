import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { expireStaleHolds } from "@/lib/reservations";

/**
 * Marks a hold as paid/confirmed. In demo mode (no live Stripe key) this just
 * flips the status — there's no real charge. With a real Stripe key, a production
 * build would confirm this only after verifying the PaymentIntent's status via a
 * webhook, not on the client's say-so; that webhook handler is not included here
 * (see README "What's stubbed").
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    await expireStaleHolds();

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { property: true },
    });

    if (!reservation || reservation.buyerId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (reservation.status !== "HOLD_PENDING_PAYMENT") {
      return NextResponse.json(
        { error: `Reservation is ${reservation.status.toLowerCase()}, cannot confirm` },
        { status: 409 }
      );
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CONFIRMED",
        amountPaid: reservation.property.reservationFee,
      },
    });

    return NextResponse.json({ reservation: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
