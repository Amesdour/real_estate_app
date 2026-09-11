import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

const statusSchema = z.object({ status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]) });

/**
 * Lets an admin override a reservation's status directly — e.g. confirming a
 * hold when the buyer paid the reservation fee offline/in person, cancelling
 * a hold on a buyer's behalf, or marking a sale/rental as completed once the
 * paperwork is done outside the app. Buyers still have their own confirm/
 * cancel routes for the normal self-serve path; this is the admin override.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");

    const json = await req.json().catch(() => null);
    const parsed = statusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { property: true },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { status } = parsed.data;

    if (status === "CONFIRMED") {
      if (reservation.status !== "HOLD_PENDING_PAYMENT") {
        return NextResponse.json(
          { error: `Reservation is ${reservation.status.toLowerCase()}, cannot confirm` },
          { status: 409 }
        );
      }
      const updated = await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "CONFIRMED", amountPaid: reservation.property.reservationFee },
      });
      return NextResponse.json({ reservation: updated });
    }

    if (status === "CANCELLED") {
      if (!["HOLD_PENDING_PAYMENT", "CONFIRMED"].includes(reservation.status)) {
        return NextResponse.json(
          { error: `Reservation is ${reservation.status.toLowerCase()}, cannot cancel` },
          { status: 409 }
        );
      }
      const [updated] = await prisma.$transaction([
        prisma.reservation.update({ where: { id: reservation.id }, data: { status: "CANCELLED" } }),
        prisma.property.updateMany({
          where: { id: reservation.propertyId, status: "RESERVED" },
          data: { status: "AVAILABLE" },
        }),
      ]);
      return NextResponse.json({ reservation: updated });
    }

    // COMPLETED: the sale/rental is done outside the app (contract signed,
    // keys handed over). Only valid from CONFIRMED, and moves the listing to
    // SOLD or RENTED so it stops showing as an open reservation anywhere.
    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: `Reservation is ${reservation.status.toLowerCase()}, cannot complete` },
        { status: 409 }
      );
    }
    const isRental = reservation.property.listingKind === "RENT";

    const [updated] = await prisma.$transaction([
      prisma.reservation.update({ where: { id: reservation.id }, data: { status: "COMPLETED" } }),
      prisma.property.update({
        where: { id: reservation.propertyId },
        data: { status: isRental ? "RENTED" : "SOLD" },
      }),
    ]);
    return NextResponse.json({ reservation: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
