import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge, Flash, PageHeader, Table, Td } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { EVENT_TYPES, type EventType } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Events" };

export default async function EventsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("events");
  const { ok } = await searchParams;
  const rows = await db.select().from(schema.events).orderBy(desc(schema.events.startsAt));
  const now = new Date();
  return (
    <>
      <PageHeader title="Events" description="Training sessions, bootcamps, workshops, hackathons and community events." actions={<Link href="/admin/events/new" className="btn-primary btn-sm"><Plus className="size-4" aria-hidden="true" /> New event</Link>} />
      <Flash ok={ok === "deleted" ? "Event deleted." : undefined} />
      <Table head={["Event", "Type", "When", "Status"]} empty="No events yet. Publish one when dates are confirmed.">
        {rows.map((e) => (
          <tr key={e.id} className="hover:bg-accent-50/60">
            <Td><Link href={`/admin/events/${e.id}`} className="font-semibold text-brand-900 hover:text-brand">{e.title}</Link><div className="text-xs text-muted">{e.isOnline ? "Online" : e.location}</div></Td>
            <Td>{EVENT_TYPES[e.type as EventType]}</Td>
            <Td className="whitespace-nowrap">{formatDateTime(e.startsAt)}</Td>
            <Td><div className="flex flex-wrap gap-1">{e.published ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}{(e.endsAt ?? e.startsAt) < now ? <Badge>Past</Badge> : null}</div></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
