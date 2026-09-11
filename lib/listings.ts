import { prisma } from "./prisma";

export const LISTING_DURATION_DAYS = 30;

export function defaultExpiryDate(): Date {
  return new Date(Date.now() + LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Flips any AVAILABLE listing whose expiresAt has passed to EXPIRED, freeing
 * admins/owners from having to notice and pull it down manually. Safe to call
 * opportunistically (see expireStaleHolds for the same pattern) and also
 * meant to run on a schedule via `npm run expire-listings`.
 */
export async function expireStaleListings() {
  const result = await prisma.property.updateMany({
    where: { status: "AVAILABLE", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
  return result.count;
}
