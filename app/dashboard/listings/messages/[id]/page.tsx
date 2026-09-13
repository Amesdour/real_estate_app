import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationThread } from "@/components/ConversationThread";

export const dynamic = "force-dynamic";

export default async function MyListingMessageThreadPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!["AGENT", "PROPERTY_OWNER"].includes(user.role)) redirect("/");

  // Page-level ownership check, mirrored again inside the API route the
  // client component calls (defense in depth).
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { property: { select: { ownerId: true } } },
  });
  if (!conversation || conversation.property?.ownerId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <ConversationThread conversationId={params.id} currentUserId={user.id} isAdmin={false} />
    </div>
  );
}
