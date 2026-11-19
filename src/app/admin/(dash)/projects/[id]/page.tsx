import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Edit project" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

export default async function EditProject({ params, searchParams }: Props) {
  await requireUser("projects");
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await db.query.projects.findFirst({ where: eq(schema.projects.id, id) }) : undefined;
  if (!p) notFound();
  const { ok, error } = await searchParams;
  return (
    <>
      <PageHeader back={{ href: "/admin/projects", label: "Project showcase" }} title={p.title} />
      <Flash ok={ok ? "Project saved." : undefined} error={error} />
      <ProjectEditor p={p} />
    </>
  );
}
