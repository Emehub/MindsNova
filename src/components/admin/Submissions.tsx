/**
 * One reusable admin screen for mentor, volunteer, partner/sponsor and
 * contact submissions. Each row expands to show every field, with status
 * and internal notes editing.
 */
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Download } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { Badge, Flash, PageHeader, statusTone } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import type { Permission } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export type Kind = "mentors" | "volunteers" | "partners" | "messages";

const CONFIG = {
  mentors: {
    table: schema.mentors,
    title: "Mentors",
    description: "Professionals who have offered to mentor.",
    perm: "community" as Permission,
    statuses: { new: "New", contacted: "Contacted", approved: "Approved", active: "Active mentor", inactive: "Inactive" },
    name: "fullName",
    sub: (r: Row) => `${r.expertise} · ${r.yearsExperience}`,
    fields: [
      ["Email", "email"], ["Phone", "phone"], ["LinkedIn or portfolio", "linkedin"], ["Area of expertise", "expertise"],
      ["Years of experience", "yearsExperience"], ["Availability", "availability"], ["Mentorship interests", "interests"], ["Background", "background"],
    ],
    search: ["fullName", "email", "expertise"],
    notes: true,
  },
  volunteers: {
    table: schema.volunteers,
    title: "Volunteers",
    description: "People who want to support programs, events and community activities.",
    perm: "community" as Permission,
    statuses: { new: "New", contacted: "Contacted", active: "Active volunteer", inactive: "Inactive" },
    name: "fullName",
    sub: (r: Row) => (r.interests as string[]).join(", "),
    fields: [["Email", "email"], ["Phone", "phone"], ["Location", "location"], ["Interests", "interests"], ["Skills", "skills"], ["Availability", "availability"], ["Message", "message"]],
    search: ["fullName", "email"],
    notes: true,
  },
  partners: {
    table: schema.partnerInquiries,
    title: "Partners and sponsors",
    description: "Partnership and sponsorship inquiries from organisations and individuals.",
    perm: "community" as Permission,
    statuses: { new: "New", in_discussion: "In discussion", confirmed: "Confirmed", declined: "Declined", archived: "Archived" },
    name: "organization",
    sub: (r: Row) => `${r.kind === "sponsor" ? "Sponsor" : "Partner"} · ${r.orgType} · ${r.contactName}`,
    fields: [["Type", "kind"], ["Contact", "contactName"], ["Email", "email"], ["Phone", "phone"], ["Organisation type", "orgType"], ["Interests", "interests"], ["Message", "message"]],
    search: ["organization", "contactName", "email"],
    notes: true,
  },
  messages: {
    table: schema.contactMessages,
    title: "Messages",
    description: "Messages from the contact form. Safeguarding concerns are flagged and should be handled first.",
    perm: "messages" as Permission,
    statuses: { new: "New", read: "Read", replied: "Replied", archived: "Archived" },
    name: "subject",
    sub: (r: Row) => `${r.fullName} · ${r.category}`,
    fields: [["From", "fullName"], ["Email", "email"], ["Category", "category"], ["Message", "message"]],
    search: ["fullName", "email", "subject", "message"],
    notes: false,
  },
} as const;

type Row = Record<string, unknown> & { id: number; status: string; createdAt: Date };

async function updateSubmission(formData: FormData) {
  "use server";
  const kind = String(formData.get("kind")) as Kind;
  const cfg = CONFIG[kind];
  if (!cfg) return;
  await requireUser(cfg.perm);
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!(status in cfg.statuses)) return;
  const set: Record<string, unknown> = { status };
  if (cfg.notes) set.internalNotes = String(formData.get("internalNotes") || "").slice(0, 10000);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.update(cfg.table as any).set(set).where(eq((cfg.table as any).id, id));
  revalidatePath(`/admin/${kind}`);
  redirect(`/admin/${kind}?ok=1#row-${id}`);
}

async function deleteSubmission(formData: FormData) {
  "use server";
  const kind = String(formData.get("kind")) as Kind;
  const cfg = CONFIG[kind];
  if (!cfg) return;
  await requireUser(cfg.perm);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.delete(cfg.table as any).where(eq((cfg.table as any).id, Number(formData.get("id"))));
  redirect(`/admin/${kind}?ok=deleted`);
}

export async function SubmissionsPage({ kind, searchParams }: { kind: Kind; searchParams: { status?: string; q?: string; ok?: string } }) {
  const cfg = CONFIG[kind];
  await requireUser(cfg.perm);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = cfg.table as any;
  const conds: SQL[] = [];
  if (searchParams.status && searchParams.status in cfg.statuses) conds.push(eq(t.status, searchParams.status));
  if (searchParams.q) {
    const term = `%${searchParams.q.replace(/[%_]/g, "")}%`;
    conds.push(or(...cfg.search.map((c) => ilike(t[c], term)))!);
  }
  const where = conds.length ? and(...conds) : undefined;
  const [rows, [{ n }]] = await Promise.all([
    db.select().from(t).where(where).orderBy(desc(t.createdAt)).limit(200) as unknown as Promise<Row[]>,
    db.select({ n: count() }).from(t).where(where),
  ]);
  const statuses = cfg.statuses as Record<string, string>;
  const show = (v: unknown) => (Array.isArray(v) ? v.join(", ") : String(v ?? "")) || "Not given";

  return (
    <>
      <PageHeader
        title={cfg.title}
        description={`${cfg.description} ${n} total.`}
        actions={<a href={`/admin/export/${kind}`} className="btn-outline btn-sm"><Download className="size-4" aria-hidden="true" /> Export CSV</a>}
      />
      <Flash ok={searchParams.ok === "deleted" ? "Deleted." : searchParams.ok ? "Saved." : undefined} />

      <form className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row" role="search">
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" name="q" defaultValue={searchParams.q} placeholder="Search" className="input" />
        <label htmlFor="status" className="sr-only">Status</label>
        <select id="status" name="status" defaultValue={searchParams.status ?? ""} className="input sm:max-w-56">
          <option value="">All statuses</option>
          {Object.entries(statuses).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="btn-secondary btn-sm">Filter</button>
        {conds.length ? <Link href={`/admin/${kind}`} className="btn-outline btn-sm">Clear</Link> : null}
      </form>

      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((r) => {
            const urgent = kind === "messages" && r.category === "Safeguarding concern";
            return (
              <li key={r.id} id={`row-${r.id}`} className={`rounded-2xl border bg-white ${urgent ? "border-red-300" : "border-line"}`}>
                <details>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-brand-900">{String(r[cfg.name])}</span>
                      <span className="block truncate text-sm text-muted">{cfg.sub(r)}</span>
                    </span>
                    {urgent ? <Badge tone="danger">Safeguarding</Badge> : null}
                    <span className="text-sm text-muted">{formatDateTime(r.createdAt)}</span>
                    <Badge tone={statusTone(r.status)}>{statuses[r.status] ?? r.status}</Badge>
                  </summary>
                  <div className="grid gap-6 border-t border-line p-4 lg:grid-cols-[1.4fr_1fr]">
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {cfg.fields.map(([label, key]) => (
                        <div key={key} className={["background", "message", "skills"].includes(key) ? "sm:col-span-2" : ""}>
                          <dt className="text-sm text-muted">{label}</dt>
                          <dd className="whitespace-pre-line break-words">
                            {key === "email" ? <a className="link" href={`mailto:${String(r[key])}`}>{String(r[key])}</a> : key === "linkedin" && r[key] ? <a className="link" href={String(r[key])} target="_blank" rel="noopener noreferrer">{String(r[key])}</a> : show(r[key])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="space-y-3">
                      <form action={updateSubmission} className="space-y-3">
                        <input type="hidden" name="kind" value={kind} />
                        <input type="hidden" name="id" value={r.id} />
                        <div>
                          <label className="label" htmlFor={`s-${r.id}`}>Status</label>
                          <select id={`s-${r.id}`} name="status" defaultValue={r.status} className="input">
                            {Object.entries(statuses).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        {cfg.notes ? (
                          <div>
                            <label className="label" htmlFor={`n-${r.id}`}>Internal notes</label>
                            <textarea id={`n-${r.id}`} name="internalNotes" defaultValue={String(r.internalNotes ?? "")} rows={3} className="input" />
                          </div>
                        ) : null}
                        <SubmitButton>Save</SubmitButton>
                      </form>
                      <form action={deleteSubmission}>
                        <input type="hidden" name="kind" value={kind} />
                        <input type="hidden" name="id" value={r.id} />
                        <ConfirmButton>Delete</ConfirmButton>
                      </form>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white p-12 text-center text-muted">Nothing here yet.</div>
      )}
    </>
  );
}
