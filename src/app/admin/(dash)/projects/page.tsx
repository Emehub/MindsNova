import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge, Flash, PageHeader, Table, Td } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { PROJECT_TYPES } from "@/lib/catalog";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Project showcase" };

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("projects");
  const { ok } = await searchParams;
  const rows = await db.select().from(schema.projects).orderBy(desc(schema.projects.updatedAt));
  return (
    <>
      <PageHeader title="Project showcase" description="Approved projects appear in the Innovation Hub showcase." actions={<Link href="/admin/projects/new" className="btn-primary btn-sm"><Plus className="size-4" aria-hidden="true" /> New project</Link>} />
      <Flash ok={ok === "deleted" ? "Project deleted." : undefined} />
      <Table head={["Project", "Type", "Technologies", "Status"]} empty="No projects yet.">
        {rows.map((p) => (
          <tr key={p.id} className="hover:bg-accent-50/60">
            <Td><Link href={`/admin/projects/${p.id}`} className="font-semibold text-brand-900 hover:text-brand">{p.title}</Link></Td>
            <Td>{PROJECT_TYPES[p.type as keyof typeof PROJECT_TYPES]}</Td>
            <Td>{p.technologies.join(", ")}</Td>
            <Td>{p.published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Awaiting approval</Badge>}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
