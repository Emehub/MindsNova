import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/admin/client";
import { Flash } from "@/components/admin/kit";
import { Logo } from "@/components/Logo";
import { createSession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { rateLimit } from "@/lib/spam";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Compared against when the email is unknown, so both cases take the same time.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("timing-equaliser-not-a-password"));

async function login(formData: FormData) {
  "use server";
  if (!(await rateLimit("login", 8, 900))) redirect("/admin/login?error=rate");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = email ? await db.query.users.findFirst({ where: eq(schema.users.email, email) }) : undefined;
  const ok = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !ok || !user.active) redirect("/admin/login?error=invalid");
  await createSession(user.id);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  redirect("/admin");
}

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if (await getCurrentUser()) redirect("/admin");
  const { error } = await searchParams;
  const message =
    error === "rate" ? "Too many sign-in attempts. Please wait 15 minutes and try again." : error === "invalid" ? "That email and password do not match an active account." : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-accent-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><Logo /></div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold">Administrator sign in</h1>
          <p className="mt-1 text-sm text-muted">For MindsNova Hub staff only.</p>
          <div className="mt-6"><Flash error={message} /></div>
          <form action={login} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" autoComplete="username" required className="input" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
            </div>
            <SubmitButton variant="primary" className="w-full !min-h-11">Sign in</SubmitButton>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted">Forgotten your password? Ask a Super Administrator to reset it.</p>
      </div>
    </main>
  );
}
