import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { expireStaleHolds } from "@/lib/reservations";

/** Every reservation across all buyers and listings. SUPER_ADMIN only. */
export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    await expireStaleHolds();

    const reservations = await prisma.reservation.findMany({
      include: {
        property: { select: { title: true, slug: true } },
        buyer: { select: { email: true } },
      },
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
