import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

const statusSchema = z.object({ status: z.enum(["OPEN", "CLOSED"]) });

/** Marks a thread resolved (CLOSED) or reopens it. SUPER_ADMIN only. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");

    const json = await req.json().catch(() => null);
    const parsed = statusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const conversation = await prisma.conversation.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ conversation });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
