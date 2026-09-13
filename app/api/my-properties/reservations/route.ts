import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

/**
 * Reservations on the current user's OWN listings only — this is
 * intentionally read-only (no status-change actions here). Confirming,
 * cancelling, or completing a reservation stays admin-only
 * (/api/admin/reservations); an agent's task here is limited to seeing
 * status and handling the buyer conversation, not overriding payment state.
 */
export async function GET() {
  try {
    const user = await requireUser();

    const reservations = await prisma.reservation.findMany({
      where: { property: { ownerId: user.id } },
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
