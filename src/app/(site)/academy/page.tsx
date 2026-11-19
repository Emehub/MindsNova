import { ArrowRight, Award, CalendarDays, GraduationCap, Laptop, Mic, Sparkles, Users, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryIcon } from "@/components/Icon";
import { CtaBand, EmptyState, EventCard, PageHero, ProgramCard, SectionHeading } from "@/components/site/ui";
import { PROGRAM_CATEGORIES } from "@/lib/catalog";
import { getPrograms, getUpcomingEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "MindsNova Academy",
  description:
    "MindsNova Academy: AI talks, career readiness, mentorship, entry-level job preparation, computer literacy and workplace skills for young people in Ghana.",
  alternates: { canonical: "/academy" },
};

const PATHWAYS = [
  { title: "Getting started", steps: ["computer-literacy", "ai-talks", "career-readiness"], text: "For young people building digital confidence for the first time." },
  { title: "Job seeker", steps: ["career-readiness", "entry-level-jobs", "workplace-skills"], text: "For school leavers and graduates preparing for a first role." },
  { title: "Growing professional", steps: ["mentorship", "workplace-skills", "ai-talks"], text: "For young people in their first jobs who want to keep growing." },
];

const FORMATS = [
  { icon: GraduationCap, title: "Courses", text: "Structured programs that build skills step by step, with real workplace tasks throughout." },
  { icon: Zap, title: "Bootcamps", text: "Intensive, focused programs designed to build job-ready skills quickly." },
  { icon: Mic, title: "Career talks", text: "Experienced professionals share how the job market works and how to grow at work." },
  { icon: Users, title: "Workshops", text: "Short, practical sessions on a single tool, skill or topic." },
  { icon: Award, title: "Scholarships", text: "Support that removes cost as a barrier for learners who need it most." },
  { icon: Sparkles, title: "Certification", text: "Certificates of completion, and guidance towards recognised certifications such as Microsoft Office Specialist." },
  ];

const SHORT: Record<string, string> = {
  "ai-talks": "AI Talks",
  "career-readiness": "Career Readiness",
  mentorship: "Mentorship",
  "entry-level-jobs": "Entry-Level Jobs",
  "computer-literacy": "Computer Literacy",
  "workplace-skills": "Workplace Skills",
};

export default async function AcademyPage() {
  const [programs, training] = await Promise.all([
    getPrograms(),
    getUpcomingEvents({ types: ["training", "bootcamp", "workshop", "career_talk", "webinar", "info_session"], limit: 6 }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="MindsNova Academy"
        title="Learn the skills. Get job-ready. Shape your future."
        intro="MindsNova Academy is home to our education and training: practical courses, learning pathways, workshops and career talks that take learners from their first click to their first job."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/apply" className="btn-primary">Apply for a course <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <a href="#pathways" className="btn-outline">See learning pathways</a>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Ways to learn" title="Learning that fits where you are" align="center" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="reveal card p-6">
                <span className="icon-tile"><Icon className="size-6" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-accent-50" id="courses">
        <div className="container-page">
          <SectionHeading
            eyebrow="Available courses"
            title="Our course catalogue"
            intro="Each course shows its current application status. Where an intake has not been scheduled yet, you can register your interest."
            action={<Link href="/programs" className="btn-outline">Browse by category</Link>}
          />
          {programs.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((p) => <div key={p.id} className="reveal"><ProgramCard program={p} /></div>)}
            </div>
          ) : (
            <EmptyState title="Courses are being prepared">Subscribe to our newsletter to hear when courses open.</EmptyState>
          )}
        </div>
      </section>

      <section className="section" id="pathways">
        <div className="container-page">
          <SectionHeading eyebrow="Learning pathways" title="Follow a path, build a career" intro="Pathways combine courses in a recommended order, so each one builds on the last." />
          <div className="grid gap-5 md:grid-cols-3">
            {PATHWAYS.map((p) => (
              <article key={p.title} className="reveal card p-6 sm:p-7">
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-1.5 text-muted">{p.text}</p>
                <ol className="mt-5 flex flex-wrap items-center gap-2">
                  {p.steps.map((s, i) => {
                    const c = PROGRAM_CATEGORIES.find((x) => x.slug === s)!;
                    return (
                      <li key={s} className="flex items-center gap-2">
                        <Link href={`/programs#${s}`} className="inline-flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-100">
                          <span className="sr-only">Step {i + 1}: </span>
                          <CategoryIcon name={c.icon} className="size-4 text-brand" />
                          {SHORT[s] ?? c.title}
                        </Link>
                        {i < p.steps.length - 1 ? <ArrowRight className="size-4 shrink-0 text-accent" aria-hidden="true" /> : null}
                      </li>
                    );
                  })}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-accent-50" id="upcoming">
        <div className="container-page">
          <SectionHeading eyebrow="Upcoming training" title="Training sessions, bootcamps and workshops" action={<Link href="/events" className="btn-outline">All events</Link>} />
          {training.length ? (
            <div className="grid gap-4 md:grid-cols-2">{training.map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <EmptyState
              icon={<CalendarDays className="size-7" aria-hidden="true" />}
              title="No sessions scheduled yet"
              action={<Link href="/#newsletter" className="btn-primary">Notify me</Link>}
            >
              New training sessions, bootcamps and workshops are announced here and in our newsletter.
            </EmptyState>
          )}
        </div>
      </section>

      <section className="section" id="mentorship">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <article className="reveal card p-8">
            <span className="icon-tile"><Users className="size-6" aria-hidden="true" /></span>
            <h2 className="mt-5 text-2xl font-extrabold">Mentorship programs</h2>
            <p className="mt-3 text-muted">
              Every learner benefits from someone who has walked the path. Our mentorship programs pair learners with experienced professionals and role models for guidance on skills, careers and confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/apply?program=mentorship" className="btn-primary">Find a mentor</Link>
              <Link href="/get-involved#mentor" className="btn-outline">Become a mentor</Link>
            </div>
          </article>
          <article className="reveal card p-8" id="scholarships">
            <span className="icon-tile"><Award className="size-6" aria-hidden="true" /></span>
            <h2 className="mt-5 text-2xl font-extrabold">Scholarships and certification</h2>
            <p className="mt-3 text-muted">
              We are working with partners and sponsors so that cost is never the reason a talented young person misses out. Scholarship opportunities and certification details are announced with each intake.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/resources?category=scholarships" className="btn-outline">Scholarship announcements</Link>
              <Link href="/get-involved#sponsor" className="btn-outline">Fund a scholarship</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-page">
          <div className="reveal flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-line bg-white p-8 sm:flex-row sm:items-center">
            <span className="icon-tile size-14"><Laptop className="size-7" aria-hidden="true" /></span>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold">Online learning platform: in development</h2>
              <p className="mt-1 text-muted">
                We are building an online space with student accounts, video lessons, assignments, quizzes, progress tracking and certificates.
              </p>
            </div>
            <Link href="/#newsletter" className="btn-outline shrink-0">Stay updated</Link>
          </div>
        </div>
      </section>

      <CtaBand title="Ready to start learning?" text="Apply for a course or register your interest in an upcoming intake.">
        <Link href="/apply" className="btn-primary">Apply now <ArrowRight className="size-4" aria-hidden="true" /></Link>
        <Link href="/programs" className="btn-outline">Explore programs</Link>
      </CtaBand>
    </>
  );
}
