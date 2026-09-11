import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

/** All buyer↔platform threads, newest activity first. SUPER_ADMIN only. */
export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");

    const conversations = await prisma.conversation.findMany({
      include: {
        buyer: { select: { id: true, email: true } },
        property: { select: { id: true, title: true, slug: true } },
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
