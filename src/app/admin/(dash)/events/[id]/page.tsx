import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EventEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Edit event" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

export default async function EditEvent({ params, searchParams }: Props) {
  await requireUser("events");
  const id = Number((await params).id);
  const e = Number.isInteger(id) ? await db.query.events.findFirst({ where: eq(schema.events.id, id) }) : undefined;
  if (!e) notFound();
  const { ok, error } = await searchParams;
  const programs = await db.select({ id: schema.programs.id, title: schema.programs.title }).from(schema.programs).orderBy(asc(schema.programs.title));
  return (
    <>
      <PageHeader back={{ href: "/admin/events", label: "Events" }} title={e.title} />
      <Flash ok={ok ? "Event saved." : undefined} error={error} />
      <EventEditor e={e} programs={programs} />
    </>
  );
}
