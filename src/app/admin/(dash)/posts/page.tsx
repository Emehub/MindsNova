import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Badge, Flash, PageHeader, Table, Td } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { resourceCategory } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Resources and blog" };

export default async function PostsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireUser("posts");
  const { ok } = await searchParams;
  const rows = await db.select().from(schema.posts).orderBy(desc(schema.posts.updatedAt));
  const now = new Date();
  return (
    <>
      <PageHeader title="Resources and blog" description="Articles, tutorials, opportunities and announcements." actions={<Link href="/admin/posts/new" className="btn-primary btn-sm"><Plus className="size-4" aria-hidden="true" /> New article</Link>} />
      <Flash ok={ok === "deleted" ? "Article deleted." : undefined} />
      <Table head={["Title", "Category", "Status", "Publish date"]} empty="No articles yet.">
        {rows.map((p) => {
          const status = p.status !== "published" ? "draft" : p.publishAt && p.publishAt > now ? "scheduled" : "published";
          return (
            <tr key={p.id} className="hover:bg-accent-50/60">
              <Td><Link href={`/admin/posts/${p.id}`} className="font-semibold text-brand-900 hover:text-brand">{p.title}</Link></Td>
              <Td>{resourceCategory(p.category)?.title}</Td>
              <Td><Badge tone={status === "published" ? "success" : status === "scheduled" ? "info" : "neutral"}>{status[0].toUpperCase() + status.slice(1)}</Badge></Td>
              <Td className="whitespace-nowrap">{p.publishAt ? formatDateTime(p.publishAt) : "Not set"}</Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
