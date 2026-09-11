import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

/**
 * Fetches one thread with all its messages. A conversation is only visible to
 * the buyer who started it or to a SUPER_ADMIN — never to the property's
 * agent/owner, since they're not a party to it by design.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        property: { select: { id: true, title: true, slug: true } },
        buyer: { select: { id: true, email: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, role: true, email: true } } } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwnerBuyer = conversation.buyerId === user.id;
    const isAdmin = user.role === "SUPER_ADMIN";
    if (!isOwnerBuyer && !isAdmin) {
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
