/** Run on a schedule (e.g. daily cron). `npm run expire-listings`. */
import { prisma } from "../lib/prisma";
import { expireStaleListings } from "../lib/listings";

async function main() {
  const count = await expireStaleListings();
  console.log(`Expired ${count} stale listing(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
