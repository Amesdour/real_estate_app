import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/");

  const conversations = await prisma.conversation.findMany({
    include: {
      buyer: { select: { email: true } },
      property: { select: { title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl text-brand-900">Messages</h1>
      <p className="mt-1 text-sm text-brand-700">Every buyer thread. Agents and owners never see these.</p>

      {conversations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-200 p-12 text-center text-brand-700">
          No messages yet.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/messages/${c.id}`}
                className="block rounded-2xl border border-brand-200 bg-white p-5 hover:shadow-md hover:shadow-brand-900/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-base text-brand-900">
                      {c.property?.title ?? "General inquiry"}
                    </p>
                    <p className="text-xs text-brand-700">{c.buyer.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      c.status === "OPEN" ? "bg-brand-100 text-brand-700" : "bg-brand-50 text-brand-700/70"
                    }`}
                  >
                    {c.status === "OPEN" ? "Open" : "Closed"}
                  </span>
                </div>
                {c.messages[0] && (
                  <p className="mt-1 truncate text-sm text-brand-700">{c.messages[0].body}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
