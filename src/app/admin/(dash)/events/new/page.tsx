import { asc } from "drizzle-orm";
import { EventEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "New event" };

export default async function NewEvent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser("events");
  const { error } = await searchParams;
  const programs = await db.select({ id: schema.programs.id, title: schema.programs.title }).from(schema.programs).orderBy(asc(schema.programs.title));
  return (
    <>
      <PageHeader back={{ href: "/admin/events", label: "Events" }} title="New event" />
      <Flash error={error} />
      <EventEditor programs={programs} />
    </>
  );
}
