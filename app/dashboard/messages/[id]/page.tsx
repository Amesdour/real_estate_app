import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationThread } from "@/components/ConversationThread";

export const dynamic = "force-dynamic";

export default async function MyMessageThreadPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Ownership check happens here (page-level) AND again inside the API route
  // the client component calls — defense in depth, since the client fetch
  // could otherwise be pointed at someone else's conversation id.
  const conversation = await prisma.conversation.findUnique({ where: { id: params.id } });
  if (!conversation || conversation.buyerId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <ConversationThread conversationId={params.id} currentUserId={user.id} isAdmin={false} />
    </div>
  );
}
