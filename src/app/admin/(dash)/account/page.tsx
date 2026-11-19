import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/admin/client";
import { Flash, Input, PageHeader, Panel } from "@/components/admin/kit";
import { createSession, hashPassword, passwordProblem, requireUser, verifyPassword } from "@/lib/auth";
import { ROLES } from "@/lib/catalog";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Account" };

async function changePassword(fd: FormData) {
  "use server";
  const me = await requireUser();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  const confirm = String(fd.get("confirm") || "");
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, me.id) });
  if (!user || !(await verifyPassword(current, user.passwordHash))) redirect("/admin/account?error=Your+current+password+is+incorrect");
  if (next !== confirm) redirect("/admin/account?error=The+new+passwords+do+not+match");
  const problem = passwordProblem(next);
  if (problem) redirect(`/admin/account?error=${encodeURIComponent(problem)}`);
  await db.update(schema.users).set({ passwordHash: await hashPassword(next) }).where(eq(schema.users.id, me.id));
  // Sign out every other device, then start a fresh session here.
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, me.id));
  await createSession(me.id);
  redirect("/admin/account?ok=1");
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const me = await requireUser();
  const { ok, error } = await searchParams;
  return (
    <>
      <PageHeader title="Your account" description={`${me.name} · ${me.email} · ${ROLES[me.role]}`} />
      <Flash ok={ok ? "Password changed. Other devices have been signed out." : undefined} error={error} />
      <Panel title="Change password" className="max-w-xl">
        <form action={changePassword} className="space-y-4">
          <Input name="current" type="password" label="Current password" required />
          <Input name="next" type="password" label="New password" required hint="At least 12 characters, with upper and lower case letters and numbers." />
          <Input name="confirm" type="password" label="Confirm new password" required />
          <SubmitButton variant="primary">Change password</SubmitButton>
        </form>
      </Panel>
    </>
  );
}
