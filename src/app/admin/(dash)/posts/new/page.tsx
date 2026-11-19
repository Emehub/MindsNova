import { PostEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "New article" };

export default async function NewPost({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser("posts");
  const { error } = await searchParams;
  return (
    <>
      <PageHeader back={{ href: "/admin/posts", label: "Resources and blog" }} title="New article" />
      <Flash error={error} />
      <PostEditor />
    </>
  );
}
