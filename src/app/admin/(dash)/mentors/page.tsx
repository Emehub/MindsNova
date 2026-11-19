import { SubmissionsPage } from "@/components/admin/Submissions";

export const metadata = { title: "Mentors" };

type Props = { searchParams: Promise<{ status?: string; q?: string; ok?: string }> };

export default async function Page({ searchParams }: Props) {
  return <SubmissionsPage kind="mentors" searchParams={await searchParams} />;
}
