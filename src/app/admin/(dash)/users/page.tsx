import { asc, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/admin/client";
import { Badge, Flash, Input, PageHeader, Panel, Select, Table, Td, opts } from "@/components/admin/kit";
import { hashPassword, requireUser } from "@/lib/auth";
import { ROLES, ROLE_PERMISSIONS, type Role } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Users and roles" };

const tempPassword = () => randomBytes(9).toString("base64url") + "A7";

async function createUser(fd: FormData) {
  "use server";
  await requireUser("users");
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const name = String(fd.get("name") || "").trim().slice(0, 120);
  const role = String(fd.get("role")) as Role;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) redirect("/admin/users?error=Enter+a+name+and+valid+email");
  if (!(role in ROLES)) redirect("/admin/users?error=Choose+a+role");
  if (await db.query.users.findFirst({ where: eq(schema.users.email, email) })) redirect("/admin/users?error=That+email+already+has+an+account");
  const pw = tempPassword();
  await db.insert(schema.users).values({ email, name, role, passwordHash: await hashPassword(pw) });
  redirect(`/admin/users?created=${encodeURIComponent(email)}&pw=${encodeURIComponent(pw)}`);
}

async function updateUser(fd: FormData) {
  "use server";
  const me = await requireUser("users");
  const id = Number(fd.get("id"));
  const role = String(fd.get("role")) as Role;
  const active = fd.get("active") === "on";
  if (!(role in ROLES)) return;
  if (id === me.id && (role !== "super_admin" || !active)) redirect("/admin/users?error=You+cannot+remove+your+own+Super+Administrator+access");
  await db.update(schema.users).set({ role, active }).where(eq(schema.users.id, id));
  if (!active) await db.delete(schema.sessions).where(eq(schema.sessions.userId, id));
  revalidatePath("/admin/users");
  redirect("/admin/users?ok=1");
}

async function resetPassword(fd: FormData) {
  "use server";
  await requireUser("users");
  const id = Number(fd.get("id"));
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
  if (!user) return;
  const pw = tempPassword();
  await db.update(schema.users).set({ passwordHash: await hashPassword(pw) }).where(eq(schema.users.id, id));
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, id));
  redirect(`/admin/users?created=${encodeURIComponent(user.email)}&pw=${encodeURIComponent(pw)}&reset=1`);
}

type Props = { searchParams: Promise<{ ok?: string; error?: string; created?: string; pw?: string; reset?: string }> };

export default async function UsersAdmin({ searchParams }: Props) {
  const me = await requireUser("users");
  const sp = await searchParams;
  const users = await db.select().from(schema.users).orderBy(asc(schema.users.name));

  return (
    <>
      <PageHeader title="Users and roles" description="Give each staff member their own account with the least access they need." />
      <Flash ok={sp.ok ? "User updated." : undefined} error={sp.error} />
      {sp.created && sp.pw ? (
        <div role="status" className="mb-6 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-brand-900">
          <p className="font-semibold">{sp.reset ? "Password reset" : "Account created"} for {sp.created}.</p>
          <p className="mt-1">Temporary password: <code className="rounded bg-white px-2 py-0.5 font-mono text-base">{sp.pw}</code></p>
          <p className="mt-1 text-muted">Share it securely (not by group chat). It will not be shown again. Ask them to change it under Account after signing in.</p>
        </div>
      ) : null}

      <Table head={["Name", "Role and access", "Last sign in", ""]}>
        {users.map((u) => (
          <tr key={u.id}>
            <Td><span className="font-semibold">{u.name}</span>{u.id === me.id ? <span className="ml-2"><Badge tone="info">You</Badge></span> : null}<div className="text-xs text-muted">{u.email}</div></Td>
            <Td>
              <form action={updateUser} id={`u-${u.id}`} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={u.id} />
                <label className="sr-only" htmlFor={`role-${u.id}`}>Role</label>
                <select id={`role-${u.id}`} name="role" defaultValue={u.role} className="input w-auto py-1.5 text-sm">
                  {Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="active" defaultChecked={u.active} className="accent-brand" /> Active</label>
                <SubmitButton variant="outline">Save</SubmitButton>
              </form>
            </Td>
            <Td className="whitespace-nowrap text-muted">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</Td>
            <Td>
              <form action={resetPassword}><input type="hidden" name="id" value={u.id} /><button className="text-sm font-semibold text-brand hover:text-brand-800">Reset password</button></form>
            </Td>
          </tr>
        ))}
      </Table>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Add a user">
          <form action={createUser} className="space-y-4">
            <Input name="name" label="Full name" required />
            <Input name="email" type="email" label="Email" required />
            <Select name="role" label="Role" required defaultValue="application_reviewer" options={opts(ROLES)} />
            <SubmitButton variant="primary">Create account</SubmitButton>
          </form>
        </Panel>
        <Panel title="What each role can do">
          <dl className="space-y-3 text-sm">
            {(Object.keys(ROLES) as Role[]).map((r) => (
              <div key={r}>
                <dt className="font-semibold">{ROLES[r]}</dt>
                <dd className="text-muted">{ROLE_PERMISSIONS[r].filter((p) => p !== "dashboard").map((p) => p.replace("_", " ")).join(", ")}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
