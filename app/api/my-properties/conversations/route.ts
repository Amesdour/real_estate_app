import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

/** Buyer conversations about the current user's OWN listings only. */
export async function GET() {
  try {
    const user = await requireUser();

    const conversations = await prisma.conversation.findMany({
      where: { property: { ownerId: user.id } },
      include: {
        buyer: { select: { email: true } },
        property: { select: { title: true, slug: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ conversations });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
