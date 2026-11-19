import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Globe, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/Icon";
import { EventCard, Paragraphs, ProgramCard, StatusBadge, Visual } from "@/components/site/ui";
import { PROGRAM_APPLICATION_STATUS, SITE, categoryBySlug, type ProgramApplicationStatus } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { categoryPhoto } from "@/lib/images";
import { getProgram, getPrograms } from "@/lib/queries";
import { formatDate, siteUrl } from "@/lib/utils";
import { and, asc, eq, gte } from "drizzle-orm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProgram((await params).slug);
  if (!p) return { title: "Program not found" };
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/programs/${p.slug}` },
    openGraph: { title: p.title, description: p.summary, images: p.imageUrl ? [p.imageUrl] : undefined },
  };
}

export default async function ProgramPage({ params }: Props) {
  const program = await getProgram((await params).slug);
  if (!program) notFound();
  const category = categoryBySlug(program.category);
  const status = PROGRAM_APPLICATION_STATUS[program.applicationStatus as ProgramApplicationStatus] ?? PROGRAM_APPLICATION_STATUS.interest;

  const [related, sessions] = await Promise.all([
    getPrograms().then((all) => all.filter((p) => p.id !== program.id).slice(0, 3)),
    db
      .select()
      .from(schema.events)
      .where(and(eq(schema.events.programId, program.id), eq(schema.events.published, true), gte(schema.events.startsAt, new Date())))
      .orderBy(asc(schema.events.startsAt))
      .catch(() => []),
  ]);

  const facts = [
    { icon: Users, label: "Who it is for", value: program.audience || "Open to all" },
    { icon: Globe, label: "Learning format", value: program.format || "To be confirmed" },
    { icon: Clock, label: "Duration", value: program.duration || "To be confirmed" },
    { icon: CalendarDays, label: "Start date", value: program.startDate ? formatDate(program.startDate) : "To be confirmed" },
  ];

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.summary,
    url: siteUrl(`/programs/${program.slug}`),
    provider: { "@type": "EducationalOrganization", name: SITE.name, sameAs: siteUrl() },
    teaches: program.outcomes,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <section className="relative overflow-hidden bg-accent-50">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href={`/programs#${program.category}`} className="link-arrow text-sm">
              <ArrowLeft className="size-4" aria-hidden="true" /> {category?.title ?? "All programs"}
            </Link>
            <div className="mt-5"><StatusBadge status={program.applicationStatus} /></div>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{program.title}</h1>
            <p className="lead mt-5">{program.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {status.open ? (
                <Link href={`/apply?program=${program.slug}`} className="btn-primary">
                  {status.cta} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link href="/#newsletter" className="btn-primary">Get notified about the next intake</Link>
              )}
              <a href="#curriculum" className="btn-outline">View curriculum</a>
            </div>
            {program.applicationDeadline ? (
              <p className="mt-4 text-sm font-semibold text-brand-900">Application deadline: {formatDate(program.applicationDeadline)}</p>
            ) : null}
          </div>
          <Visual src={program.imageUrl || categoryPhoto(program.category)?.src} alt={program.imageUrl ? program.imageAlt : categoryPhoto(program.category)?.alt} icon={category?.icon} label={category?.title} className="aspect-[4/3] w-full rounded-[var(--radius-card)] shadow-lift" priority />
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="overview">
            <h2 id="overview" className="text-2xl font-extrabold">Overview</h2>
            <Paragraphs text={program.description || program.summary} className="mt-4 text-lg text-muted" />
          </section>

          {program.outcomes.length ? (
            <section aria-labelledby="outcomes">
              <h2 id="outcomes" className="text-2xl font-extrabold">What you will be able to do</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {program.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3 rounded-2xl bg-accent-50 p-4">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-white"><Check className="size-3.5" aria-hidden="true" /></span>
                    <span className="font-medium text-brand-900">{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {program.curriculum.length ? (
            <section id="curriculum" aria-labelledby="curriculum-title" className="scroll-mt-28">
              <h2 id="curriculum-title" className="text-2xl font-extrabold">Curriculum</h2>
              <ol className="mt-6 space-y-3">
                {program.curriculum.map((m, i) => (
                  <li key={m.title + i} className="card flex gap-4 p-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand font-display text-sm font-bold text-white">{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-bold">{m.title}</h3>
                      {m.description ? <p className="mt-1 text-muted">{m.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-muted">The curriculum may be adapted to each cohort&apos;s needs and level.</p>
            </section>
          ) : null}

          <section aria-labelledby="eligibility">
            <h2 id="eligibility" className="text-2xl font-extrabold">Eligibility</h2>
            <p className="mt-4 text-lg text-muted">{program.eligibility || "Open to young people with an interest in technology."}</p>
          </section>

          <section aria-labelledby="apply-info" className="rounded-[var(--radius-card)] border border-accent-200 bg-accent-50 p-6 sm:p-8">
            <h2 id="apply-info" className="text-2xl font-extrabold">How to apply</h2>
            <ol className="mt-5 space-y-3 text-muted">
              <li><strong className="text-brand-900">1. Complete the online form.</strong> It takes about ten minutes. Applicants under 18 need a parent or guardian&apos;s consent.</li>
              <li><strong className="text-brand-900">2. Receive your reference number</strong> by email, and use it to check your status at any time.</li>
              <li><strong className="text-brand-900">3. We review every application</strong> and email you as your status changes.</li>
            </ol>
            {program.applicationStatus === "interest" ? (
              <p className="mt-5 rounded-xl bg-white p-4 text-[0.95rem] text-brand-900">
                The next intake for this program has not been scheduled yet. Registering your interest now means you will be among the first we contact when dates are confirmed.
              </p>
            ) : null}
            {status.open ? (
              <Link href={`/apply?program=${program.slug}`} className="btn-primary mt-6">{status.cta}</Link>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start" aria-label="Program details">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              {category ? <span className="icon-tile size-10"><CategoryIcon name={category.icon} className="size-5" /></span> : null}
              <p className="font-display font-bold text-brand-900">At a glance</p>
            </div>
            <dl className="mt-5 space-y-4">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                  <div>
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="font-semibold text-brand-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {status.open ? <Link href={`/apply?program=${program.slug}`} className="btn-primary mt-6 w-full">{status.cta}</Link> : null}
          </div>
          {sessions.length ? (
            <div>
              <h2 className="mb-3 text-lg font-bold">Upcoming sessions</h2>
              <div className="space-y-3">{sessions.map((e) => <EventCard key={e.id} event={e} />)}</div>
            </div>
          ) : null}
        </aside>
      </div>

      {related.length ? (
        <section className="section border-t border-line bg-accent-50">
          <div className="container-page">
            <h2 className="mb-8 text-3xl font-extrabold">Explore other programs</h2>
            <div className="grid gap-6 md:grid-cols-3">{related.map((p) => <ProgramCard key={p.id} program={p} />)}</div>
          </div>
        </section>
      ) : null}
    </>
  );
}
