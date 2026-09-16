import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MyMessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { buyerId: user.id },
    include: {
      property: { select: { title: true, slug: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900 dark:text-cream">Messages</h1>
      <p className="mt-1 text-sm text-brand-700 dark:text-honey-white">Your conversations with the Terraco team.</p>

      {conversations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-brand-700 dark:text-honey-white">
          No messages yet. Ask a question from any listing page to start one.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/messages/${c.id}`}
                className="card card-interactive block p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-base text-brand-900 dark:text-cream">
                    {c.property?.title ?? "General inquiry"}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      c.status === "OPEN" ? "bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-honey-white" : "bg-brand-50 dark:bg-brand-800 text-brand-700/70 dark:text-honey-white/70"
                    }`}
                  >
                    {c.status === "OPEN" ? "Open" : "Closed"}
                  </span>
                </div>
                {c.messages[0] && (
                  <p className="mt-1 truncate text-sm text-brand-700 dark:text-honey-white">{c.messages[0].body}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
