import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

/**
 * A user's own listings — i.e. properties where they are the owner
 * (Property.ownerId). This is what "assigned to an agent" means in this
 * app: an agent's own listings, not a separate assignment table. Any
 * logged-in user can call this; it just returns an empty list if they
 * haven't listed anything (e.g. a plain buyer).
 */
export async function GET() {
  try {
    const user = await requireUser();

    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      include: {
        _count: { select: { reservations: true, conversations: true } },
      },
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
