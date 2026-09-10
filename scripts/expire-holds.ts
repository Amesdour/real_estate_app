/**
 * Run this on a schedule (e.g. a cron job every minute, or a platform's scheduled
 * functions) so holds expire even when nobody happens to hit a route that triggers
 * the lazy expiry check. `npm run expire-holds`.
 */
import { prisma } from "../lib/prisma";
import { expireStaleHolds } from "../lib/reservations";

async function main() {
  const count = await expireStaleHolds();
  console.log(`Expired ${count} stale reservation hold(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
