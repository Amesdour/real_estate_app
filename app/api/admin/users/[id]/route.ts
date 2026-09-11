import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

const roleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "AGENT", "BUYER_TENANT", "PROPERTY_OWNER"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole("SUPER_ADMIN");

    if (admin.id === params.id) {
      return NextResponse.json(
        { error: "You can't change your own role" },
        { status: 400 }
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = roleSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: parsed.data.role },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
