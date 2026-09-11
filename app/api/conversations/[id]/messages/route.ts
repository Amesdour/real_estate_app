import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { messageCreateSchema } from "@/lib/validation";

/** Sends a reply in an existing thread. Only the buyer or a SUPER_ADMIN may post. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const conversation = await prisma.conversation.findUnique({ where: { id: params.id } });
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwnerBuyer = conversation.buyerId === user.id;
    const isAdmin = user.role === "SUPER_ADMIN";
    if (!isOwnerBuyer && !isAdmin) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const json = await req.json().catch(() => null);
    const parsed = messageCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: conversation.id, senderId: user.id, body: parsed.data.body },
        include: { sender: { select: { id: true, role: true, email: true } } },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        // Re-opens the thread if the admin had marked it CLOSED and the buyer
        // writes back in; an admin reply doesn't need to change status.
        data: isOwnerBuyer ? { status: "OPEN" } : {},
      }),
    ]);

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
