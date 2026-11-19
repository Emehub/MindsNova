import { ProgramEditor } from "@/components/admin/editors";
import { Flash, PageHeader } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "New program" };

export default async function NewProgram({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser("programs");
  const { error } = await searchParams;
  return (
    <>
      <PageHeader back={{ href: "/admin/programs", label: "Programs" }} title="New program" />
      <Flash error={error} />
      <ProgramEditor />
    </>
  );
}
