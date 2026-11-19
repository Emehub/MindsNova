import { SubmissionsPage } from "@/components/admin/Submissions";

export const metadata = { title: "Volunteers" };

type Props = { searchParams: Promise<{ status?: string; q?: string; ok?: string }> };

export default async function Page({ searchParams }: Props) {
  return <SubmissionsPage kind="volunteers" searchParams={await searchParams} />;
}
