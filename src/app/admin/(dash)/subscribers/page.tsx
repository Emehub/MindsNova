import { count, desc, eq, ilike } from "drizzle-orm";
import { Download } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmButton } from "@/components/admin/client";
import { Badge, Flash, PageHeader, Table, Td, statusTone } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Newsletter subscribers" };

async function setStatus(fd: FormData) {
  "use server";
  await requireUser("subscribers");
  const status = fd.get("status") === "subscribed" ? "subscribed" : "unsubscribed";
  await db
    .update(schema.subscribers)
    .set({ status, unsubscribedAt: status === "unsubscribed" ? new Date() : null })
    .where(eq(schema.subscribers.id, Number(fd.get("id"))));
  revalidatePath("/admin/subscribers");
  redirect("/admin/subscribers?ok=1");
}

async function remove(fd: FormData) {
  "use server";
  await requireUser("subscribers");
  await db.delete(schema.subscribers).where(eq(schema.subscribers.id, Number(fd.get("id"))));
  redirect("/admin/subscribers?ok=deleted");
}

export default async function SubscribersAdmin({ searchParams }: { searchParams: Promise<{ q?: string; ok?: string }> }) {
  await requireUser("subscribers");
  const { q, ok } = await searchParams;
  const where = q ? ilike(schema.subscribers.email, `%${q.replace(/[%_]/g, "")}%`) : undefined;
  const [rows, [{ active }]] = await Promise.all([
    db.select().from(schema.subscribers).where(where).orderBy(desc(schema.subscribers.createdAt)).limit(500),
    db.select({ active: count() }).from(schema.subscribers).where(eq(schema.subscribers.status, "subscribed")),
  ]);

  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        description={<>{active} active subscriber{Number(active) === 1 ? "" : "s"}. Export to CSV to import into your email service (for example Mailchimp or Brevo). Only email people with status &ldquo;subscribed&rdquo;.</>}
        actions={<a href="/admin/export/subscribers" className="btn-outline btn-sm"><Download className="size-4" aria-hidden="true" /> Export CSV</a>}
      />
      <Flash ok={ok === "deleted" ? "Subscriber deleted." : ok ? "Saved." : undefined} />
      <form className="mb-6 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search by email</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by email" className="input max-w-sm" />
        <button className="btn-secondary btn-sm">Search</button>
      </form>
      <Table head={["Email", "Interests", "Joined", "Status", ""]} empty="No subscribers yet.">
        {rows.map((s) => (
          <tr key={s.id}>
            <Td><span className="font-semibold">{s.email}</span>{s.name ? <div className="text-xs text-muted">{s.name}</div> : null}</Td>
            <Td className="max-w-xs text-muted">{s.interests.join(", ") || "All"}</Td>
            <Td className="whitespace-nowrap">{formatDate(s.createdAt, { month: "short" })}</Td>
            <Td><Badge tone={statusTone(s.status)}>{s.status === "subscribed" ? "Subscribed" : "Unsubscribed"}</Badge></Td>
            <Td>
              <div className="flex flex-wrap gap-2">
                <form action={setStatus}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="status" value={s.status === "subscribed" ? "unsubscribed" : "subscribed"} />
                  <button className="btn-outline btn-sm">{s.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}</button>
                </form>
                <form action={remove}><input type="hidden" name="id" value={s.id} /><ConfirmButton>Delete</ConfirmButton></form>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
