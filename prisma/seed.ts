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

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isVerified: true,
    },
  });

  const properties = [
    {
      title: "Villa ensoleillée 3 chambres à Hydra",
      description:
        "Une villa lumineuse et moderne à cinq minutes de la corniche, avec une cuisine ouverte, un jardin paysager et une piscine privée.",
      type: "VILLA" as const,
      price: 38500000,
      reservationFee: 150000,
      address: "12 Rue des Oliviers",
      city: "Alger",
      country: "Algérie",
      latitude: 36.7525,
      longitude: 3.042,
      attributes: { chambres: 3, salles_de_bain: 2, surface_m2: 210, piscine: true },
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      ],
    },
    {
      title: "Appartement F3 rénové au centre-ville",
      description:
        "À proximité de tout : cafés, transports et parcs. Cuisine et salle de bain récemment rénovées, très lumineux.",
      type: "APARTMENT" as const,
      price: 0,
      reservationFee: 20000,
      address: "45 Boulevard Central",
      city: "M'Sila",
      country: "Algérie",
      latitude: 35.7058,
      longitude: 4.5415,
      attributes: { chambres: 2, salles_de_bain: 1, surface_m2: 85, meuble: true, type_annonce: "LOCATION", loyer_mensuel_da: 45000 },
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
      ],
    },
    {
      title: "Terrain agricole d'1 hectare",
      description:
        "Terrain plat et dégagé, accès routier, acte de propriété enregistré. Adapté à un usage agricole ou à un projet de construction légère.",
      type: "LAND" as const,
      price: 6200000,
      reservationFee: 50000,
      address: "Route Nationale 8",
      city: "M'Sila",
      country: "Algérie",
      latitude: 35.72,
      longitude: 4.55,
      attributes: { surface_m2: 10000, zonage: "agricole" },
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
  console.log(`  admin:  ${admin.email} / password123`);
  console.log(`  ${properties.length} properties`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
