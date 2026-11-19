import { count, desc, eq, gte, sql, sum } from "drizzle-orm";
import Link from "next/link";
import { Badge, Flash, PageHeader, Panel, statusTone } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { APPLICATION_STATUSES, can, type ApplicationStatus } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/utils";

type Props = { searchParams: Promise<{ denied?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  const user = await requireUser("dashboard");
  const { denied } = await searchParams;
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  const showApps = can(user.role, "applications");
  const showAnalytics = can(user.role, "analytics");
  const showCommunity = can(user.role, "community");

  const [byStatus, recent, views, topPages, daily, counts] = await Promise.all([
    showApps
      ? db.select({ status: schema.applications.status, n: count() }).from(schema.applications).groupBy(schema.applications.status)
      : Promise.resolve([]),
    showApps ? db.select().from(schema.applications).orderBy(desc(schema.applications.createdAt)).limit(6) : Promise.resolve([]),
    showAnalytics ? db.select({ n: sum(schema.pageViews.views) }).from(schema.pageViews).where(gte(schema.pageViews.day, since)) : Promise.resolve([{ n: "0" }]),
    showAnalytics
      ? db
          .select({ path: schema.pageViews.path, n: sql<number>`sum(${schema.pageViews.views})`.mapWith(Number) })
          .from(schema.pageViews)
          .where(gte(schema.pageViews.day, since))
          .groupBy(schema.pageViews.path)
          .orderBy(desc(sql`sum(${schema.pageViews.views})`))
          .limit(8)
      : Promise.resolve([]),
    showAnalytics
      ? db
          .select({ day: schema.pageViews.day, n: sql<number>`sum(${schema.pageViews.views})`.mapWith(Number) })
          .from(schema.pageViews)
          .where(gte(schema.pageViews.day, since))
          .groupBy(schema.pageViews.day)
          .orderBy(schema.pageViews.day)
      : Promise.resolve([]),
    showCommunity
      ? Promise.all([
          db.select({ n: count() }).from(schema.mentors).where(eq(schema.mentors.status, "new")),
          db.select({ n: count() }).from(schema.volunteers).where(eq(schema.volunteers.status, "new")),
          db.select({ n: count() }).from(schema.partnerInquiries).where(eq(schema.partnerInquiries.status, "new")),
          db.select({ n: count() }).from(schema.subscribers).where(eq(schema.subscribers.status, "subscribed")),
        ])
      : Promise.resolve(null),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, Number(r.n)]));
  const totalApps = byStatus.reduce((a, r) => a + Number(r.n), 0);

  // Fill missing days so the chart shows a continuous 30 day window.
  const dayMap = new Map(daily.map((d) => [String(d.day), d.n]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10);
    return { day: d, n: dayMap.get(d) ?? 0 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.n));

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Here is what is happening across MindsNova Hub." />
      <Flash error={denied ? "Your role does not have access to that section." : undefined} />

      {showApps ? (
        <section aria-label="Applications" className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Link href="/admin/applications" className="rounded-2xl bg-brand p-5 text-white hover:bg-brand-700">
            <p className="text-sm text-white/80">All applications</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{totalApps}</p>
          </Link>
          {(Object.keys(APPLICATION_STATUSES) as ApplicationStatus[]).map((s) => (
            <Link key={s} href={`/admin/applications?status=${s}`} className="rounded-2xl border border-line bg-white p-5 hover:border-brand">
              <p className="text-sm text-muted">{APPLICATION_STATUSES[s]}</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-brand-900">{statusMap[s] ?? 0}</p>
            </Link>
          ))}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {showApps ? (
          <Panel title="Latest applications" actions={<Link href="/admin/applications" className="text-sm font-semibold text-brand">View all</Link>}>
            {recent.length ? (
              <ul className="divide-y divide-line">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/applications/${a.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{a.fullName}{a.isMinor ? <span className="ml-2 align-middle"><Badge tone="info">Under 18</Badge></span> : null}</span>
                        <span className="block truncate text-sm text-muted">{a.programTitle} · {formatDate(a.createdAt)}</span>
                      </span>
                      <Badge tone={statusTone(a.status)}>{APPLICATION_STATUSES[a.status as ApplicationStatus]}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-muted">No applications yet. They will appear here as soon as someone applies.</p>
            )}
          </Panel>
        ) : null}

        {counts ? (
          <Panel title="Community inbox">
            <ul className="space-y-3">
              {[
                { href: "/admin/mentors", label: "New mentor registrations", n: counts[0][0].n },
                { href: "/admin/volunteers", label: "New volunteers", n: counts[1][0].n },
                { href: "/admin/partners", label: "New partner and sponsor inquiries", n: counts[2][0].n },
                { href: "/admin/subscribers", label: "Newsletter subscribers", n: counts[3][0].n },
              ].map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="flex items-center justify-between rounded-xl bg-accent-50 px-4 py-3 hover:bg-accent-100">
                    <span className="font-medium text-brand-900">{x.label}</span>
                    <span className="font-display text-xl font-extrabold text-brand">{Number(x.n)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>

      {showAnalytics ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Website visits, last 30 days">
            <p className="font-display text-3xl font-extrabold text-brand-900">{Number(views[0]?.n ?? 0).toLocaleString("en-GB")} <span className="text-base font-semibold text-muted">page views</span></p>
            <div className="mt-6 flex h-40 items-end gap-1" role="img" aria-label="Daily page views for the last 30 days">
              {days.map((d) => (
                <div key={d.day} className="group relative flex-1">
                  <div className="rounded-t bg-accent transition-colors group-hover:bg-brand" style={{ height: `${Math.max(2, (d.n / maxDay) * 152)}px` }} />
                  <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-brand-900 px-2 py-1 text-xs text-white group-hover:block">
                    {formatDate(d.day, { day: "numeric", month: "short", year: undefined })}: {d.n}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Privacy friendly counts: page and day only, no cookies or IP addresses. Connect Google Analytics in settings for more detail.</p>
          </Panel>
          <Panel title="Most visited pages">
            {topPages.length ? (
              <ol className="space-y-2 text-sm">
                {topPages.map((p) => (
                  <li key={p.path} className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-brand-900">{p.path}</span>
                    <span className="font-semibold">{p.n.toLocaleString("en-GB")}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-6 text-center text-muted">No visits recorded yet.</p>
            )}
          </Panel>
        </div>
      ) : null}
    </>
  );
}
