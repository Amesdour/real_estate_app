import { prisma } from "./prisma";

export const HOLD_DURATION_MINUTES = 15;

/**
 * Expires any holds whose deadline has passed and frees the underlying property
 * back to AVAILABLE (unless something else already moved it further, e.g. SOLD).
 * This is deliberately idempotent and cheap so it's safe to call opportunistically
 * on read paths, in addition to running it on a schedule (see scripts/expire-holds.ts).
 */
export async function expireStaleHolds() {
  const stale = await prisma.reservation.findMany({
    where: { status: "HOLD_PENDING_PAYMENT", holdExpiresAt: { lt: new Date() } },
    select: { id: true, propertyId: true },
  });

  if (stale.length === 0) return 0;

  await prisma.$transaction([
    prisma.reservation.updateMany({
      where: { id: { in: stale.map((s) => s.id) } },
      data: { status: "EXPIRED" },
    }),
    prisma.property.updateMany({
      where: {
        id: { in: stale.map((s) => s.propertyId) },
        status: "RESERVED",
      },
      data: { status: "AVAILABLE" },
    }),
  ]);

  return stale.length;
}
