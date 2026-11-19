import { ProjectEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "New project" };

export default async function NewProject({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser("projects");
  const { error } = await searchParams;
  return (
    <>
      <PageHeader back={{ href: "/admin/projects", label: "Project showcase" }} title="New project" />
      <Flash error={error} />
      <ProjectEditor />
    </>
  );
}
