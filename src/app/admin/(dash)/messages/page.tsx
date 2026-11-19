import { SubmissionsPage } from "@/components/admin/Submissions";

export const metadata = { title: "Messages" };

type Props = { searchParams: Promise<{ status?: string; q?: string; ok?: string }> };

export default async function Page({ searchParams }: Props) {
  return <SubmissionsPage kind="messages" searchParams={await searchParams} />;
}
