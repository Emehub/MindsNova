import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProgramEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Edit program" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

export default async function EditProgram({ params, searchParams }: Props) {
  await requireUser("programs");
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await db.query.programs.findFirst({ where: eq(schema.programs.id, id) }) : undefined;
  if (!p) notFound();
  const { ok, error } = await searchParams;
  return (
    <>
      <PageHeader back={{ href: "/admin/programs", label: "Programs" }} title={p.title} />
      <Flash ok={ok ? "Program saved." : undefined} error={error} />
      <ProgramEditor p={p} />
    </>
  );
}
