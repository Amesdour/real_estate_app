import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { properties: true, reservations: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
