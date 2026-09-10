import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
    });

    if (!reservation || reservation.buyerId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!["HOLD_PENDING_PAYMENT", "CONFIRMED"].includes(reservation.status)) {
      return NextResponse.json(
        { error: "This reservation can no longer be cancelled" },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "CANCELLED" },
      }),
      prisma.property.updateMany({
        where: { id: reservation.propertyId, status: "RESERVED" },
        data: { status: "AVAILABLE" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
