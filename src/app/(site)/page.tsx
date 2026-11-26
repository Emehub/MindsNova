import { ArrowRight, BookOpen, BriefcaseBusiness, Compass, Mic, Quote, Route, Sparkles, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/PublicForms";
import { ArrowLink, EventCard, ProgramCard, SectionHeading, Visual } from "@/components/site/ui";
import { NEWSLETTER_INTERESTS, PROGRAM_CATEGORIES, SITE } from "@/lib/catalog";
import { getFeaturedPrograms, getUpcomingEvents, getVerifiedImpact } from "@/lib/queries";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import { HERO_SLIDES, categoryPhoto } from "@/lib/images";
import { getSetting } from "@/lib/settings";

const PILLARS = [
  { icon: BookOpen, title: "Learn", text: "Computer literacy, AI and the everyday skills every workplace expects, taught simply." },
  { icon: Mic, title: "Hear", text: "Talks from professionals of all backgrounds on careers, AI and the world of work." },
  { icon: Users, title: "Connect", text: "Mentors and role models who guide, encourage and open doors." },
  { icon: BriefcaseBusiness, title: "Thrive", text: "Career readiness and support to land and grow in a first job." },
];

/** UN Sustainable Development Goals our work contributes to, in their official colours. */
const SDGS = [
  {
    goal: 4,
    title: "Quality Education",
    color: "#C5192D",
    points: ["Computer basics and digital literacy", "Everyday workplace tools", "Practical, responsible use of AI", "Free learning resources and workshops"],
  },
  {
    goal: 5,
    title: "Gender Equality",
    color: "#FF3A21",
    points: ["Programs designed for girls and young women", "Female role models and mentors", "Safe, inclusive learning spaces", "Women in technology leadership"],
  },
  {
    goal: 8,
    title: "Decent Work and Economic Growth",
    color: "#A21942",
    points: ["Job-ready digital skills", "CV, interview and job search support", "Career talks with professionals", "Pathways into first jobs and internships"],
  },
];

const TALK_TOPICS = [
  { icon: TrendingUp, title: "The job market today", text: "Which sectors are hiring and where opportunities are found." },
  { icon: BriefcaseBusiness, title: "Skills employers want", text: "What makes a young applicant stand out." },
  { icon: Route, title: "Your first job", text: "What to expect at work and how to grow quickly." },
  { icon: Compass, title: "Growing your career", text: "How professionals chose and changed their paths." },
];

const JOURNEY = [
  { title: "Build confidence", text: "Get comfortable with computers, the internet and everyday digital tools." },
  { title: "Hear from professionals", text: "Talks on AI, careers and corporate life from people already in the field." },
  { title: "Find a mentor", text: "Learn from someone who has walked the journey before you." },
  { title: "Step into work", text: "Prepare your CV, practise interviews and apply for your first role." },
];

export default async function HomePage() {
  const [home, featured, impact, talks] = await Promise.all([
    getSetting("home"),
    getFeaturedPrograms(3),
    getVerifiedImpact(),
    getUpcomingEvents({ types: ["career_talk"], limit: 2 }),
  ]);
  // Only programs that are actually taking applications are highlighted.
  const openPrograms = featured.filter((p) => p.applicationStatus === "open");

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE.name,
    slogan: SITE.tagline,
    description: SITE.description,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    address: { "@type": "PostalAddress", addressLocality: "Accra", addressCountry: "GH" },
    areaServed: ["Ghana", "Africa"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* ---------------- Hero ---------------- */}
      {/* On desktop the hero is exactly one screen tall, so the headline, buttons and photo are all visible on arrival. */}
      <section className="relative overflow-hidden bg-[radial-gradient(60%_80%_at_0%_10%,var(--color-accent-100),transparent_70%),radial-gradient(45%_60%_at_100%_100%,#fff7e0,transparent_70%)] lg:flex lg:min-h-svh lg:items-center">
        <div className="container-page grid items-center gap-12 py-10 sm:py-14 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:py-6">
          <div>
            <p className="eyebrow-pill animate-in">Learn. Connect. Get job-ready.</p>
            <h1 className="mt-5 text-[2.45rem] font-semibold leading-[1.1] sm:text-6xl lg:mt-4 lg:text-[clamp(2.75rem,min(4.4vw,7.4svh),4.25rem)] lg:leading-[1.06]">
              <span className="block animate-in [animation-delay:100ms]">Empowering minds.</span>
              <span className="block animate-in [animation-delay:220ms]">Building skills.</span>
              <span className="block animate-in text-gradient-anim [animation-delay:340ms]">Shaping the future.</span>
            </h1>
            <p className="mt-5 max-w-xl animate-in text-[1.05rem] leading-relaxed text-muted [animation-delay:460ms] sm:text-xl lg:mt-4 lg:text-[clamp(1rem,2.4svh,1.25rem)]">
              MindsNova Hub is a social enterprise in Accra, Ghana, helping young people, particularly girls and young women, build the confidence, digital skills and connections to step into the world of work, through talks, mentorship and practical programs led by people already in the field.
            </p>
            <div className="mt-8 flex animate-in flex-col gap-3 [animation-delay:580ms] sm:flex-row lg:mt-7">
              <Link href="/programs" className="btn-primary group">Explore Programs <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></Link>
              <Link href="/get-involved#partner" className="btn-outline">Partner With Us</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg animate-in-scale [animation-delay:200ms] lg:mr-0 lg:w-auto lg:max-w-none lg:justify-self-end">
            <div className="absolute -left-6 -top-6 size-32 rounded-full bg-accent/15 blur-2xl animate-blob" aria-hidden="true" />
            <div className="absolute -bottom-10 -right-4 size-40 rounded-full bg-amber-200/40 blur-2xl animate-blob [animation-delay:-4s]" aria-hidden="true" />
            <HeroSlideshow
              slides={home.heroImage ? [{ src: home.heroImage, alt: home.heroImageAlt || "" }, ...HERO_SLIDES] : HERO_SLIDES}
              className="aspect-[4/5] w-full rounded-3xl rounded-bl-[7rem] shadow-lift sm:rounded-bl-[9rem] lg:aspect-square lg:h-[min(36rem,calc(100svh-var(--header-space)-5.5rem))] lg:w-auto lg:rounded-bl-[7rem]"
            />
            <figure className="absolute -bottom-8 right-0 z-10 max-w-[19rem] animate-float rounded-2xl bg-white p-5 shadow-lift sm:-right-6 sm:p-6 lg:-bottom-6 lg:max-w-[16.5rem] lg:p-5">
              <div className="flex gap-3">
                <Quote className="size-7 shrink-0 -scale-x-100 text-accent" aria-hidden="true" />
                <blockquote className="font-medium leading-snug text-ink">
                  When a young woman gets her first job, a whole family moves forward.
                </blockquote>
              </div>
              <figcaption className="mt-3 pl-10 text-xs font-semibold uppercase tracking-[0.12em] text-accent">Our purpose</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------- Program ticker ---------------- */}
      <div className="marquee border-y border-brand-800 bg-brand-900 py-4 text-white" aria-label="Our programs">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={copy === 1 ? true : undefined}>
              {PROGRAM_CATEGORIES.map((c) => (
                <li key={c.slug} className="flex items-center gap-3 whitespace-nowrap text-lg font-medium">
                  <Sparkles className="size-4 text-accent-400" aria-hidden="true" />
                  {c.title}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* ---------------- What we do ---------------- */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="What we do" title="We help young people get ready for work." align="center" />
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="reveal group flex flex-col items-center text-center">
                <span className="icon-circle"><Icon className="size-8" aria-hidden="true" /></span>
                <h3 className="mt-6 text-lg font-semibold uppercase tracking-[0.06em]">{title}</h3>
                <p className="mt-3 max-w-xs text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Programs ---------------- */}
      <section className="section bg-accent-50" aria-labelledby="programs-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our programs"
            title={<span id="programs-heading">Programs for every stage of your journey.</span>}
            action={<ArrowLink href="/programs">Explore all programs</ArrowLink>}
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_CATEGORIES.map((c, i) => (
              <li key={c.slug} className="reveal" style={{ transitionDelay: `${(i % 3) * 60}ms` }}>
                <article className="card-hover relative flex h-full flex-col overflow-hidden">
                  <Visual src={categoryPhoto(c.slug)?.src} alt={categoryPhoto(c.slug)?.alt} icon={c.icon} className="aspect-[16/10] w-full" label="" />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <p className="mt-2 flex-1 text-[0.95rem] text-muted">{c.short}</p>
                    <Link href={`/programs#${c.slug}`} className="link-arrow mt-5 text-sm after:absolute after:inset-0">
                      Learn more <ArrowRight className="size-4" aria-hidden="true" />
                      <span className="sr-only"> about {c.title}</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {openPrograms.length ? (
            <div className="mt-16">
              <h3 className="mb-6 text-2xl font-semibold">Open for applications now</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {openPrograms.map((p) => (
                  <div key={p.id} className="reveal"><ProgramCard program={p} /></div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ---------------- Impact (only verified figures) ---------------- */}
      {impact.length ? (
        <section className="section" aria-labelledby="impact-heading">
          <div className="container-page">
            <SectionHeading eyebrow="Our impact" title={<span id="impact-heading">We measure what matters.</span>} align="center" />
            <ul className={`grid gap-10 sm:grid-cols-2 ${impact.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} ${impact.length >= 5 ? "xl:grid-cols-6" : ""}`}>
              {impact.map((m) => (
                <li key={m.id} className="reveal text-center">
                  <p className="text-5xl font-semibold tracking-tight text-accent">
                    <span data-countup={m.value!}>{m.value!.toLocaleString("en-GB")}</span>{m.suffix}
                  </p>
                  <p className="mt-3 text-muted">{m.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ---------------- SDG commitment ---------------- */}
      <section className={`section ${impact.length ? "bg-accent-50" : ""}`}>
        <div className="container-page grid items-center gap-12 lg:grid-cols-[0.85fr_1.6fr] lg:gap-14">
          <div className="reveal">
            <p className="eyebrow">Our SDG commitment</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[2.6rem] sm:leading-[1.12]">Building an inclusive digital future.</h2>
            <p className="mt-5 text-lg text-muted">
              Our work contributes to the United Nations Sustainable Development Goals, with gender equality in technology at its heart.
            </p>
            <ArrowLink href="/about" className="mt-7">Learn more about us</ArrowLink>
          </div>
          <ul className="grid gap-5 md:grid-cols-3">
            {SDGS.map((g) => (
              <li key={g.goal} className="reveal card p-6">
                <span className="grid size-12 place-items-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: g.color }}>
                  {g.goal}
                </span>
                <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.06em]">
                  <span className="sr-only">Sustainable Development Goal {g.goal}: </span>{g.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-muted">
                  {g.points.map((p) => (
                    <li key={p} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />{p}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Career talks ---------------- */}
      <section className={`section ${impact.length ? "" : "bg-accent-50"}`} id="career-talks">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-12">
          <div className="reveal">
            <p className="eyebrow">Career talks and mentorship</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[2.6rem] sm:leading-[1.12]">Learn from people already doing the job.</h2>
            <p className="mt-5 text-lg text-muted">
              Skills open the door, but people help you walk through it. We invite experienced professionals to talk honestly with our young people about the job market, the skills employers want, and how to navigate the workplace and grow a career.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/career-talks" className="btn-primary">See career talks</Link>
              <Link href="/get-involved#mentor" className="btn-outline">Become a speaker</Link>
            </div>
          </div>
          <div className="reveal">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TALK_TOPICS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="card p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-accent-100 text-accent"><Icon className="size-5" aria-hidden="true" /></span>
                  <p className="mt-4 font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </li>
              ))}
            </ul>
            {talks.length ? (
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-semibold">Coming up</h3>
                <div className="space-y-3">{talks.map((e) => <EventCard key={e.id} event={e} />)}</div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------------- Journey to a first job ---------------- */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Your journey" title="From your first click to your first job." align="center" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((s, i) => (
              <li key={s.title} className="reveal card p-6">
                <span className="text-3xl font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href="/apply" className="btn-primary">Start your journey <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* ---------------- Newsletter ---------------- */}
      <section className="section bg-accent-50" id="newsletter">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className="reveal">
            <p className="eyebrow">Newsletter</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[2.6rem] sm:leading-[1.12]">Stay connected with MindsNova Hub.</h2>
            <p className="mt-5 text-lg text-muted">Be first to hear about:</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {NEWSLETTER_INTERESTS.map((t) => (
                <li key={t} className="flex items-center gap-2 font-medium text-ink">
                  <Sparkles className="size-4 text-accent" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal card p-6 sm:p-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
