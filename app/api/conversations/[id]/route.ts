import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

/**
 * Fetches one thread with all its messages. Visible to: the buyer who
 * started it, a SUPER_ADMIN (sees everything), or the AGENT/PROPERTY_OWNER
 * who listed the property this thread is about (sees only threads on their
 * OWN listings, not anyone else's) — still fully platform-mediated and
 * logged, just with the listing's own staff/owner now able to answer
 * questions about it directly instead of everything routing through admin.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        property: { select: { id: true, title: true, slug: true, ownerId: true } },
        buyer: { select: { id: true, email: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, role: true, email: true } } } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwnerBuyer = conversation.buyerId === user.id;
    const isAdmin = user.role === "SUPER_ADMIN";
    const isListingOwner = conversation.property?.ownerId === user.id;
    if (!isOwnerBuyer && !isAdmin && !isListingOwner) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
