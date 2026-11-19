import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Edit article" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

export default async function EditPost({ params, searchParams }: Props) {
  await requireUser("posts");
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await db.query.posts.findFirst({ where: eq(schema.posts.id, id) }) : undefined;
  if (!p) notFound();
  const { ok, error } = await searchParams;
  return (
    <>
      <PageHeader back={{ href: "/admin/posts", label: "Resources and blog" }} title={p.title} />
      <Flash ok={ok ? "Article saved." : undefined} error={error} />
      <PostEditor p={p} />
    </>
  );
}
