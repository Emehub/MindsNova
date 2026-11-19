import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge, Flash, PageHeader, Table, Td } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { PROGRAM_APPLICATION_STATUS, categoryBySlug, type ProgramApplicationStatus } from "@/lib/catalog";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Programs" };

export default async function ProgramsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("programs");
  const { ok } = await searchParams;
  const rows = await db.select().from(schema.programs).orderBy(asc(schema.programs.sortOrder), asc(schema.programs.title));
  return (
    <>
      <PageHeader title="Programs" description="Courses and training programs shown on the website." actions={<Link href="/admin/programs/new" className="btn-primary btn-sm"><Plus className="size-4" aria-hidden="true" /> New program</Link>} />
      <Flash ok={ok === "deleted" ? "Program deleted." : undefined} />
      <Table head={["Program", "Category", "Applications", "Visibility"]} empty="No programs yet.">
        {rows.map((p) => (
          <tr key={p.id} className="hover:bg-accent-50/60">
            <Td><Link href={`/admin/programs/${p.id}`} className="font-semibold text-brand-900 hover:text-brand">{p.title}</Link><div className="text-xs text-muted">/programs/{p.slug}</div></Td>
            <Td>{categoryBySlug(p.category)?.title ?? p.category}</Td>
            <Td><Badge tone={p.applicationStatus === "open" ? "success" : p.applicationStatus === "closed" ? "neutral" : "info"}>{PROGRAM_APPLICATION_STATUS[p.applicationStatus as ProgramApplicationStatus]?.label}</Badge></Td>
            <Td><div className="flex flex-wrap gap-1">{p.published ? <Badge tone="success">Published</Badge> : <Badge>Hidden</Badge>}{p.featured ? <Badge tone="brand">Featured</Badge> : null}</div></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
