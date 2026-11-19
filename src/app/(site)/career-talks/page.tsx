import { ArrowRight, BriefcaseBusiness, CalendarDays, Compass, MessageCircleQuestion, Route, TrendingUp, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, EmptyState, EventCard, PageHero, SectionHeading } from "@/components/site/ui";
import { PHOTOS } from "@/lib/images";
import { getUpcomingEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Career Talks",
  description:
    "MindsNova Hub Career Talks: experienced professionals speak with young people in Ghana about the job market, the skills employers want and how to navigate the workplace.",
  alternates: { canonical: "/career-talks" },
};

const TOPICS = [
  { icon: TrendingUp, title: "The job market today", text: "Which sectors are hiring, what entry-level roles look like and where opportunities are found." },
  { icon: BriefcaseBusiness, title: "Skills employers want", text: "The digital, communication and personal skills that make a young applicant stand out." },
  { icon: Route, title: "Your first job", text: "What to expect in the workplace, how to behave professionally and how to learn quickly on the job." },
  { icon: Compass, title: "Growing your career", text: "How professionals chose their paths, changed direction and kept learning along the way." },
];

const FORMAT = [
  { title: "A professional shares their story", text: "How they started, the mistakes they made and what they wish they had known at your age." },
  { title: "Practical advice", text: "Clear, honest guidance on job searching, applications, interviews and the workplace." },
  { title: "Open questions and answers", text: "Every talk leaves time for young people to ask the questions that matter to them." },
  { title: "Connections that last", text: "Speakers may go on to mentor, run mock interviews or share opportunities with learners." },
];

export default async function CareerTalksPage() {
  const talks = await getUpcomingEvents({ types: ["career_talk", "info_session", "webinar"], limit: 6 });

  return (
    <>
      <PageHero
        eyebrow="Career Talks"
        title="Learn from people already doing the job."
        intro="We invite experienced professionals to speak with our young people about the job market, the skills employers are looking for, and how to navigate the workplace and grow a career."
      >
        <div className="flex flex-wrap gap-3">
          <a href="#upcoming" className="btn-primary">Upcoming talks</a>
          <Link href="/get-involved#mentor" className="btn-outline">Become a speaker</Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="What we talk about" title="Honest answers about the world of work." align="center" />
          <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {TOPICS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="reveal flex flex-col items-center text-center">
                <span className="icon-circle"><Icon className="size-8" aria-hidden="true" /></span>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-3 max-w-xs text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-accent-50">
        <div className="container-page">
          <SectionHeading eyebrow="How a talk works" title="Short, practical and personal." align="center" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FORMAT.map((s, i) => (
              <li key={s.title} className="reveal card p-6">
                <span className="text-3xl font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="upcoming">
        <div className="container-page">
          <SectionHeading eyebrow="Upcoming" title="Upcoming career talks" action={<Link href="/events" className="btn-outline">All events</Link>} />
          {talks.length ? (
            <div className="grid gap-4 md:grid-cols-2">{talks.map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <EmptyState
              icon={<CalendarDays className="size-7" aria-hidden="true" />}
              title="No talks scheduled yet"
              action={
                <>
                  <Link href="/apply?program=entry-level-job-preparation" className="btn-primary">Register your interest</Link>
                  <Link href="/#newsletter" className="btn-outline">Get notified</Link>
                </>
              }
            >
              Career talks are announced here and in our newsletter. Register your interest and we will let you know about the next one.
            </EmptyState>
          )}
        </div>
      </section>

      <section className="section bg-accent-50" id="speak">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div className="reveal">
            <p className="eyebrow">For professionals</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[2.6rem] sm:leading-[1.12]">Share your journey with the next generation.</h2>
            <p className="mt-5 text-lg text-muted">
              You do not need to work in technology. We welcome professionals from banking, administration, human resources, health, education, sales, media, government and beyond. An hour of your time can change how a young person sees their future.
            </p>
            <p className="mt-4 text-muted">All speakers and mentors follow our <Link href="/safeguarding" className="link">safeguarding policy</Link>.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.speaker.src} alt={PHOTOS.speaker.alt} loading="lazy" className="mt-8 aspect-[16/10] w-full rounded-[var(--radius-card)] object-cover shadow-lift" />
          </div>
          <div className="reveal card p-8">
            <span className="grid size-12 place-items-center rounded-full bg-accent-100 text-accent"><Users className="size-6" aria-hidden="true" /></span>
            <h3 className="mt-5 text-xl font-semibold">Ways to get involved</h3>
            <ul className="mt-4 space-y-2.5 text-muted">
              {["Give a career talk, in person or online", "Run a mock interview session", "Review CVs", "Mentor a young person"].map((t) => (
                <li key={t} className="flex gap-2"><MessageCircleQuestion className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <Link href="/get-involved#mentor" className="btn-primary mt-7">Become a speaker <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <CtaBand title="Ready to get job-ready?" text="Build the practical digital skills employers ask for, then hear from the people who hire.">
        <Link href="/programs" className="btn-primary">Explore programs</Link>
        <Link href="/apply" className="btn-outline">Apply now</Link>
      </CtaBand>
    </>
  );
}
