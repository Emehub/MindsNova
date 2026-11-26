import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryIcon } from "@/components/Icon";
import { CtaBand, PageHero, ProgramCard } from "@/components/site/ui";
import { PROGRAM_CATEGORIES } from "@/lib/catalog";
import { getPrograms } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Our Programs",
  description:
    "MindsNova Hub programs in Ghana: AI talks, career readiness, mentorship, entry-level job preparation, computer literacy and workplace and corporate skills.",
  alternates: { canonical: "/programs" },
};

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <>
      <PageHero
        eyebrow="Our programs"
        title="Practical programs for every stage of the journey."
        intro="Six simple, practical programs that help young people build confidence, learn from professionals and step into the world of work. No previous experience needed."
      />

      {/* Category jump links */}
      <nav aria-label="Program categories" className="sticky top-[calc(var(--header-space)+0.5rem)] z-30 border-b border-line bg-white/95 backdrop-blur">
        <ul className="container-page flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {PROGRAM_CATEGORIES.map((c) => (
            <li key={c.slug} className="shrink-0">
              <a href={`#${c.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-brand-900 hover:border-brand hover:bg-accent-50">
                <CategoryIcon name={c.icon} className="size-4 text-brand" />
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page divide-y divide-line">
        {PROGRAM_CATEGORIES.map((c) => {
          const items = programs.filter((p) => p.category === c.slug);
          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-40 py-10 sm:py-12" aria-labelledby={`${c.slug}-title`}>
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                <div className="reveal">
                  <span className="icon-tile size-14"><CategoryIcon name={c.icon} className="size-7" /></span>
                  <h2 id={`${c.slug}-title`} className="mt-5 text-3xl font-extrabold">{c.title}</h2>
                  <p className="mt-4 text-lg text-muted">{c.description}</p>
                  <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-brand">What you can learn</h3>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {c.topics.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-[0.97rem] font-medium text-brand-900">
                        <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="reveal">
                  {items.length ? (
                    <div className={`grid gap-6 ${items.length > 1 ? "md:grid-cols-2" : ""}`}>
                      {items.map((p) => <ProgramCard key={p.id} program={p} />)}
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-center rounded-[var(--radius-card)] border-2 border-dashed border-line p-8 text-center">
                      <p className="font-display text-lg font-bold text-brand-900">Programs in this area are being prepared.</p>
                      <p className="mt-2 text-muted">Register your interest and we will contact you when an intake is confirmed.</p>
                      <Link href="/apply?program=undecided" className="btn-primary mx-auto mt-6">Register interest</Link>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <CtaBand title="Not sure where to start?" text="Tell us about yourself and what you want to achieve. We will help you find the right program.">
        <Link href="/apply?program=undecided" className="btn-primary">Get advice <ArrowRight className="size-4" aria-hidden="true" /></Link>
        <Link href="/contact" className="btn-outline">Contact us</Link>
      </CtaBand>
    </>
  );
}
