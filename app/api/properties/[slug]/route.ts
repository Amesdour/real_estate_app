import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const property = await prisma.property.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      documents: true,
      owner: { select: { id: true, email: true, phone: true } },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ property });
}
