import { SubmissionsPage } from "@/components/admin/Submissions";

export const metadata = { title: "Partners" };

type Props = { searchParams: Promise<{ status?: string; q?: string; ok?: string }> };

export default async function Page({ searchParams }: Props) {
  return <SubmissionsPage kind="partners" searchParams={await searchParams} />;
}
