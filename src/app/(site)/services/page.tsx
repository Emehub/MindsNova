import { ArrowRight, BarChart3, Bot, Check, Code2, GraduationCap, Lightbulb, MonitorSmartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/PublicForms";
import { PageHero, SectionHeading } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Digital solutions and technology consulting from MindsNova Hub in Accra, Ghana: websites and apps, data analytics and dashboards, AI solutions, and corporate technology training.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    icon: Lightbulb,
    title: "Technology consulting",
    text: "Practical advice on choosing, planning and adopting technology, so your organisation invests in the right tools.",
    points: ["Digital transformation planning", "Process and systems review", "Technology selection"],
  },
  {
    icon: Code2,
    title: "Software development",
    text: "Websites, web applications and mobile apps built around what your users actually need.",
    points: ["Websites and web applications", "Mobile applications", "Custom software and integrations"],
  },
  {
    icon: BarChart3,
    title: "Data analytics and dashboards",
    text: "Turn your data into clear, reliable insight that helps you make better decisions.",
    points: ["Data collection and cleaning", "Dashboards and reporting", "Data analysis"],
  },
  {
    icon: Bot,
    title: "AI solutions",
    text: "Responsible, practical uses of artificial intelligence that save time and improve your services.",
    points: ["AI readiness assessment", "Generative AI and automation", "Responsible AI guidance"],
  },
  {
    icon: MonitorSmartphone,
    title: "Digital solutions",
    text: "Everyday digital tools and setup that help small businesses and institutions work smarter.",
    points: ["Digital presence and productivity tools", "Online forms and workflows", "Ongoing technical support"],
  },
  {
    icon: GraduationCap,
    title: "Training, workshops and bootcamps",
    text: "Tailored digital skills training for your staff, students or community, delivered in person or online.",
    points: ["Staff digital skills training", "Workshops and seminars", "Bootcamps for schools and institutions"],
  },
];

const STEPS = [
  { title: "Tell us what you need", text: "Send a short inquiry describing your organisation and the problem you want to solve." },
  { title: "We talk it through", text: "We arrange a conversation to understand your goals, users and constraints." },
  { title: "You receive a proposal", text: "A clear scope, timeline and quote, with no obligation." },
  { title: "We deliver together", text: "We build, train or advise, keeping you involved at every step." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services for organisations"
        title="Digital solutions and technology consulting."
        intro="Alongside our programs for young people, MindsNova Hub works with businesses, schools, NGOs and institutions to design, build and adopt technology that works."
      >
        <div className="flex flex-wrap gap-3">
          <a href="#inquiry" className="btn-primary">Request a service <ArrowRight className="size-4" aria-hidden="true" /></a>
          <a href="#services" className="btn-outline">See what we offer</a>
        </div>
      </PageHero>

      <section className="section" id="services">
        <div className="container-page">
          <SectionHeading eyebrow="What we offer" title="How we can help your organisation" />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, text, points }) => (
              <li key={title} className="reveal card flex flex-col p-6">
                <span className="icon-tile"><Icon className="size-6" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{text}</p>
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 font-medium text-brand-900">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-accent-50">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="A simple, clear process" align="center" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="reveal card p-6">
                <span className="font-display text-3xl font-extrabold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="inquiry" data-form-scroll>
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div>
            <p className="eyebrow">Work with us</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Tell us about your project.</h2>
            <p className="mt-5 text-lg text-muted">
              Share a little about your organisation and what you need. We will reply to arrange a conversation and, where it fits, send you a proposal.
            </p>
            <p className="mt-4 text-lg text-muted">
              As a social enterprise, we are committed to growing Africa&apos;s technology talent, especially girls and young women. Interested in supporting that work directly?{" "}
              <Link href="/get-involved#partner" className="link">Become a partner</Link>.
            </p>
          </div>
          <div className="card p-6 sm:p-8">
            <ContactForm defaultCategory="Technology services" />
          </div>
        </div>
      </section>
    </>
  );
}
