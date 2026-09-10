import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const agent = await prisma.user.upsert({
    where: { email: "agent@example.com" },
    update: {},
    create: {
      email: "agent@example.com",
      passwordHash,
      role: "AGENT",
      isVerified: true,
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      email: "buyer@example.com",
      passwordHash,
      role: "BUYER_TENANT",
      isVerified: true,
    },
  });

  const properties = [
    {
      title: "Sunlit 3-Bedroom Villa in Hydra",
      description:
        "A bright, modern villa five minutes from the coast, with an open-plan kitchen, a landscaped garden, and a private pool.",
      type: "VILLA" as const,
      price: 285000,
      reservationFee: 2500,
      address: "12 Rue des Oliviers",
      city: "Algiers",
      country: "Algeria",
      latitude: 36.7525,
      longitude: 3.042,
      attributes: { bedrooms: 3, bathrooms: 2, areaSqm: 210, hasPool: true },
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      ],
    },
    {
      title: "Downtown 2-Bedroom Apartment",
      description:
        "Walkable to everything: cafes, transit, and parks. Recently renovated kitchen and bathroom, plenty of natural light.",
      type: "APARTMENT" as const,
      price: 0,
      reservationFee: 500,
      address: "45 Boulevard Central",
      city: "M'Sila",
      country: "Algeria",
      latitude: 35.7058,
      longitude: 4.5415,
      attributes: { bedrooms: 2, bathrooms: 1, areaSqm: 85, furnished: true, listingKind: "RENT", monthlyRent: 650 },
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
      ],
    },
    {
      title: "1-Hectare Agricultural Land Plot",
      description:
        "Flat, cleared land with road access and a registered title, suitable for agricultural or light development use.",
      type: "LAND" as const,
      price: 42000,
      reservationFee: 800,
      address: "Route Nationale 8",
      city: "M'Sila",
      country: "Algeria",
      latitude: 35.72,
      longitude: 4.55,
      attributes: { areaSqm: 10000, zoning: "agricultural" },
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
      ],
    },
  ];

  for (const p of properties) {
    const { images, ...data } = p;
    const slug =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 7);

    await prisma.property.create({
      data: {
        ...data,
        slug,
        status: "AVAILABLE",
        ownerId: agent.id,
        images: { create: images.map((url, i) => ({ url, isPrimary: i === 0 })) },
      },
    });
  }

  console.log("Seeded:");
  console.log(`  agent:  ${agent.email} / password123`);
  console.log(`  buyer:  ${buyer.email} / password123`);
  console.log(`  ${properties.length} properties`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
