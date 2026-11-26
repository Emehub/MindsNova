import { ArrowRight, Eye, Flag, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { CtaBand, PageHero, Paragraphs, SectionHeading, Visual } from "@/components/site/ui";
import { SITE } from "@/lib/catalog";
import { PHOTOS, PAGE_PHOTOS } from "@/lib/images";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "MindsNova Hub is a registered social enterprise in Accra, Ghana, helping young people get job-ready with practical digital skills, mentorship and career guidance, particularly girls and young women.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = await getSetting("about");
  return (
    <>
      <PageHero image={PAGE_PHOTOS.about}
        eyebrow="About us"
        title="Building an ecosystem where young minds learn, create and lead."
        intro="MindsNova Hub is a registered social enterprise based in Accra, Ghana, with an African and global outlook. We help young people build the confidence, digital skills and connections to step into the world of work."
      />

      {/* Who we are */}
      <section className="section">
        <div className="container-page grid items-start gap-12 lg:grid-cols-2 lg:gap-12">
          <div className="reveal">
            <p className="eyebrow">Who we are</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Skills for the world of work.</h2>
            <Paragraphs text={about.whoWeAre} className="mt-6 text-lg text-muted" />
          </div>
          <Visual
            src={about.image || PHOTOS.about.src}
            alt={about.image ? about.imageAlt : PHOTOS.about.alt}
            label={SITE.tagline}
            className="reveal aspect-[4/3] w-full rounded-[var(--radius-card)] shadow-lift"
          />
        </div>
      </section>

      {/* Vision and mission */}
      <section className="section bg-accent-50">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {[
            { icon: Eye, label: "Our vision", text: about.vision },
            { icon: Target, label: "Our mission", text: about.mission },
          ].map(({ icon: Icon, label, text }) => (
            <article key={label} className="reveal card p-8 sm:p-10">
              <span className="icon-tile"><Icon className="size-6" aria-hidden="true" /></span>
              <h2 className="mt-5 text-2xl font-extrabold">{label}</h2>
              <p className="mt-4 font-display text-xl font-semibold leading-relaxed text-brand-900">&ldquo;{text}&rdquo;</p>
            </article>
          ))}
        </div>
      </section>

      {/* Objectives */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Our core objectives" title="What we set out to achieve" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {about.objectives.map((o, i) => (
              <li key={o} className="reveal card flex items-start gap-4 p-6">
                <span className="font-display text-3xl font-extrabold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="pt-1.5 font-semibold text-brand-900">{o}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-accent-50">
        <div className="container-page">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow">Our core values</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">The principles that guide everything we do.</h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((v) => (
              <li key={v.title} className="reveal card p-6">
                <Flag className="size-5 text-accent" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold">{v.title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Philosophy and brand */}
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-12">
          <div className="reveal">
            <p className="eyebrow">Our philosophy</p>
            <h2 className="mt-3 text-3xl font-extrabold">{SITE.philosophy}</h2>
            <Paragraphs text={about.philosophy} className="mt-6 text-lg text-muted" />
          </div>
          <div className="reveal rounded-[2rem] border border-line bg-accent-50 p-8 sm:p-10">
            <LogoMark className="size-16" />
            <p className="eyebrow mt-6">The meaning behind our name</p>
            <h2 className="mt-3 text-3xl font-extrabold">Minds. Nova. Hub.</h2>
            <Paragraphs text={about.brandMeaning} className="mt-5 text-muted" />
          </div>
        </div>
      </section>

      <CtaBand title="Be part of the story." text="Learn with us, mentor with us, volunteer or partner with us. There is a place for you at MindsNova Hub.">
        <Link href="/programs" className="btn-primary">Explore programs <ArrowRight className="size-4" aria-hidden="true" /></Link>
        <Link href="/get-involved" className="btn-outline">Get involved</Link>
      </CtaBand>
    </>
  );
}
