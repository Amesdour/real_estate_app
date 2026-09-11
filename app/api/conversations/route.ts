import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { conversationCreateSchema } from "@/lib/validation";

/**
 * Lists the current user's own message threads with the platform. This is
 * intentionally scoped to `buyerId: user.id` — there is no "conversations for
 * my listings" view for agents/owners, because the platform (SUPER_ADMIN), not
 * the listing's agent or owner, is always the other party. Admins use
 * GET /api/admin/conversations instead to see every thread.
 */
export async function GET() {
  try {
    const user = await requireUser();

    const conversations = await prisma.conversation.findMany({
      where: { buyerId: user.id },
      include: {
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

/** Starts a new thread with the platform, optionally about a specific property. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const json = await req.json().catch(() => null);
    const parsed = conversationCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { propertyId, body } = parsed.data;

    if (propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        buyerId: user.id,
        propertyId: propertyId ?? null,
        messages: { create: { senderId: user.id, body } },
      },
      include: {
        property: { select: { id: true, title: true, slug: true } },
        messages: true,
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
