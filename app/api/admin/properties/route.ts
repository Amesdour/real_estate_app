import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");

    const properties = await prisma.property.findMany({
      include: { images: true, owner: { select: { email: true } }, reservations: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
