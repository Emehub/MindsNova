import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Download } from "lucide-react";
import Link from "next/link";
import { Badge, PageHeader, Table, Td, statusTone } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { AGE_RANGES, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Applications" };

type Props = { searchParams: Promise<{ status?: string; program?: string; q?: string; page?: string }> };
const PER_PAGE = 25;

export default async function ApplicationsPage({ searchParams }: Props) {
  await requireUser("applications");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const a = schema.applications;

  const conds: SQL[] = [];
  if (sp.status && sp.status in APPLICATION_STATUSES) conds.push(eq(a.status, sp.status));
  if (sp.program) conds.push(eq(a.programSlug, sp.program));
  if (sp.q) {
    const t = `%${sp.q.trim().replace(/[%_]/g, "")}%`;
    conds.push(or(ilike(a.fullName, t), ilike(a.email, t), ilike(a.reference, t))!);
  }
  const where = conds.length ? and(...conds) : undefined;

  const [rows, [{ n }], programs] = await Promise.all([
    db.select().from(a).where(where).orderBy(desc(a.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ n: count() }).from(a).where(where),
    db.selectDistinct({ slug: a.programSlug, title: a.programTitle }).from(a),
  ]);
  const pages = Math.max(1, Math.ceil(Number(n) / PER_PAGE));
  const qs = (o: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ status: sp.status, program: sp.program, q: sp.q, ...o })) if (v) p.set(k, String(v));
    return `?${p}`;
  };
  const ageLabel = (v: string) => AGE_RANGES.find((x) => x.value === v)?.label ?? v;

  return (
    <>
      <PageHeader
        title="Applications"
        description={`${n} application${Number(n) === 1 ? "" : "s"}${conds.length ? " matching your filters" : ""}`}
        actions={<a href={`/admin/export/applications${qs({})}`} className="btn-outline btn-sm"><Download className="size-4" aria-hidden="true" /> Export CSV</a>}
      />

      <form className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Search name, email or reference" className="input" />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={sp.status ?? ""} className="input">
          <option value="">All statuses</option>
          {Object.entries(APPLICATION_STATUSES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <label className="sr-only" htmlFor="program">Program</label>
        <select id="program" name="program" defaultValue={sp.program ?? ""} className="input">
          <option value="">All programs</option>
          {programs.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn-secondary btn-sm">Filter</button>
          {conds.length ? <Link href="/admin/applications" className="btn-outline btn-sm">Clear</Link> : null}
        </div>
      </form>

      <Table head={["Applicant", "Program", "Age", "Location", "Submitted", "Status"]} empty="No applications match. Try clearing the filters.">
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-accent-50/60">
            <Td>
              <Link href={`/admin/applications/${r.id}`} className="font-semibold text-brand-900 hover:text-brand">{r.fullName}</Link>
              <div className="text-xs text-muted">{r.reference} · {r.email}</div>
            </Td>
            <Td>{r.programTitle}</Td>
            <Td>{ageLabel(r.ageRange)}{r.isMinor ? <div><Badge tone="info">Guardian consent</Badge></div> : null}</Td>
            <Td>{r.region}, {r.country}</Td>
            <Td className="whitespace-nowrap">{formatDate(r.createdAt, { month: "short" })}</Td>
            <Td><Badge tone={statusTone(r.status)}>{APPLICATION_STATUSES[r.status as ApplicationStatus]}</Badge></Td>
          </tr>
        ))}
      </Table>

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-2">
          {page > 1 ? <Link href={qs({ page: page - 1 })} className="btn-outline btn-sm">Previous</Link> : null}
          <span className="text-sm text-muted">Page {page} of {pages}</span>
          {page < pages ? <Link href={qs({ page: page + 1 })} className="btn-outline btn-sm">Next</Link> : null}
        </nav>
      ) : null}
    </>
  );
}
