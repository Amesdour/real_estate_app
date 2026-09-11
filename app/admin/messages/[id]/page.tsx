import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ConversationThread } from "@/components/ConversationThread";

export const dynamic = "force-dynamic";

export default async function AdminMessageThreadPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <ConversationThread conversationId={params.id} currentUserId={user.id} isAdmin />
    </div>
  );
}
