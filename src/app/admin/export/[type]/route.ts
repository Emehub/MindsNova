/** CSV exports for staff: /admin/export/{applications|subscribers|mentors|volunteers|partners|messages} */
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { APPLICATION_STATUSES, can, type Permission } from "@/lib/catalog";
import { db, schema } from "@/lib/db";

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    let s = v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
    // Prevent spreadsheet formula injection.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
}

const PERMS: Record<string, Permission> = {
  applications: "applications",
  subscribers: "subscribers",
  mentors: "community",
  volunteers: "community",
  partners: "community",
  messages: "messages",
};

export async function GET(req: Request, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const user = await getCurrentUser();
  const perm = PERMS[type];
  if (!user || !perm || !can(user.role, perm)) return new Response("Not allowed", { status: 403 });
  const sp = new URL(req.url).searchParams;

  let rows: Record<string, unknown>[] = [];
  switch (type) {
    case "applications": {
      const a = schema.applications;
      const conds: SQL[] = [];
      const status = sp.get("status");
      if (status && status in APPLICATION_STATUSES) conds.push(eq(a.status, status));
      if (sp.get("program")) conds.push(eq(a.programSlug, sp.get("program")!));
      if (sp.get("q")) {
        const t = `%${sp.get("q")!.replace(/[%_]/g, "")}%`;
        conds.push(or(ilike(a.fullName, t), ilike(a.email, t), ilike(a.reference, t))!);
      }
      const data = await db.select().from(a).where(conds.length ? and(...conds) : undefined).orderBy(desc(a.createdAt));
      rows = data.map(({ internalNotes: _n, ...r }) => r);
      break;
    }
    case "subscribers":
      rows = (await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt))).map(({ token: _t, ...r }) => r);
      break;
    case "mentors":
      rows = await db.select().from(schema.mentors).orderBy(desc(schema.mentors.createdAt));
      break;
    case "volunteers":
      rows = await db.select().from(schema.volunteers).orderBy(desc(schema.volunteers.createdAt));
      break;
    case "partners":
      rows = await db.select().from(schema.partnerInquiries).orderBy(desc(schema.partnerInquiries.createdAt));
      break;
    case "messages":
      rows = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt));
      break;
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mindsnova-${type}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
