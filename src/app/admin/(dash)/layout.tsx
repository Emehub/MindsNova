import { count, eq } from "drizzle-orm";
import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { destroySession, requireUser } from "@/lib/auth";
import { ROLE_PERMISSIONS, ROLES, can } from "@/lib/catalog";
import { db, schema } from "@/lib/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | MindsNova Hub Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  await destroySession();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [[apps], [msgs]] = await Promise.all([
    can(user.role, "applications")
      ? db.select({ n: count() }).from(schema.applications).where(eq(schema.applications.status, "pending"))
      : Promise.resolve([{ n: 0 }]),
    can(user.role, "messages")
      ? db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.status, "new"))
      : Promise.resolve([{ n: 0 }]),
  ]);

  return (
    <div className="min-h-screen bg-[#f7f7fc]">
      <AdminNav permissions={ROLE_PERMISSIONS[user.role]} badges={{ "/admin/applications": Number(apps.n), "/admin/messages": Number(msgs.n) }} />
      <div className="lg:pl-64">
        <header className="flex flex-wrap items-center justify-end gap-3 border-b border-line bg-white px-4 py-3 sm:px-8">
          <Link href="/" target="_blank" className="mr-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-800">
            View website <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
          <Link href="/admin/account" className="text-right text-sm leading-tight hover:opacity-80">
            <span className="block font-semibold text-ink">{user.name}</span>
            <span className="block text-xs text-muted">{ROLES[user.role]}</span>
          </Link>
          <form action={logout}>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-brand-900 hover:bg-accent-50">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
