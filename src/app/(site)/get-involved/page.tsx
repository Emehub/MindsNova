import { Gift, GraduationCap, HandHeart, Handshake, Laptop, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MentorForm, PartnerForm, VolunteerForm } from "@/components/forms/PublicForms";
import { PageHero } from "@/components/site/ui";
import { INVOLVE_PHOTOS } from "@/lib/images";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Join MindsNova Hub as a student, mentor, volunteer, partner or sponsor, and help young people, especially girls and young women, thrive in technology.",
  alternates: { canonical: "/get-involved" },
};

const PATHS = [
  { id: "student", icon: GraduationCap, title: "Become a Student", text: "Apply for a training program." },
  { id: "mentor", icon: Users, title: "Become a Mentor", text: "Share your experience." },
  { id: "volunteer", icon: HandHeart, title: "Become a Volunteer", text: "Support programs and events." },
  { id: "partner", icon: Handshake, title: "Become a Partner", text: "Collaborate as an organisation." },
  { id: "sponsor", icon: Gift, title: "Sponsor Our Programs", text: "Fund training and opportunity." },
];

function Pathway({ id, eyebrow, title, children, aside }: { id: string; eyebrow: string; title: string; children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line py-12 sm:py-14" aria-labelledby={`${id}-title`} data-form-scroll>
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
          <div className="mt-5 space-y-4 text-lg text-muted">{aside}</div>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function GetInvolvedPage() {
  return (
    <>
      <PageHero image={INVOLVE_PHOTOS.partner}
        eyebrow="Get involved"
        title="There is a place for you in this movement."
        intro="Whether you want to learn, teach, give time, collaborate or fund opportunity, you can help more young people thrive in a digital world."
      />

      <nav aria-label="Ways to get involved" className="container-page -mt-8 relative z-10">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PATHS.map(({ id, icon: Icon, title, text }) => (
            <li key={id}>
              <a href={`#${id}`} className="card-hover flex h-full items-start gap-3 p-4 lg:flex-col">
                <span className="icon-tile size-10"><Icon className="size-5" aria-hidden="true" /></span>
                <span>
                  <span className="block font-display font-bold text-brand-900">{title}</span>
                  <span className="block text-sm text-muted">{text}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-16">
        <Pathway
          id="student"
          eyebrow="Learn with us"
          title="Become a Student"
          aside={<p>Build practical digital skills with support from mentors and peers. Most programs need no previous experience, just curiosity and commitment.</p>}
        >
          <div className="card p-8">
            <ul className="space-y-3 text-muted">
              <li>Choose a program: AI talks, career readiness, mentorship, entry-level job preparation, computer literacy or workplace and corporate skills.</li>
              <li>Complete a short application and receive a reference number.</li>
              <li>We review every application and keep you updated by email.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/apply" className="btn-primary">Apply now</Link>
              <Link href="/programs" className="btn-outline">Explore programs</Link>
            </div>
          </div>
        </Pathway>

        <Pathway
          id="mentor"
          eyebrow="Share your journey"
          title="Become a Mentor or Speaker"
          aside={
            <>
              <p>Experienced professionals from any industry can make a lasting difference by sharing their journey. Give a career talk about the job market and the workplace, run a skills session, hold mock interviews or mentor a young person. We especially welcome women who can be role models for our learners.</p>
              <p className="text-base">All mentors follow our safeguarding policy. Mentors working with under-18s may be asked for references and background checks.</p>
            </>
          }
        >
          <div className="card p-6 sm:p-8"><MentorForm /></div>
        </Pathway>

        <Pathway
          id="volunteer"
          eyebrow="Give your time"
          title="Become a Volunteer"
          aside={<p>Help us deliver programs, run events, reach communities and tell our story. Every skill is useful, from teaching to photography to logistics.</p>}
        >
          <div className="card p-6 sm:p-8"><VolunteerForm /></div>
        </Pathway>

        <Pathway
          id="partner"
          eyebrow="Collaborate"
          title="Become a Partner"
          aside={<p>Schools, universities, technology companies, corporate organisations, NGOs and public institutions can co-host programs, provide mentors, offer internships, share venues or reach new communities with us.</p>}
        >
          <div className="card p-6 sm:p-8"><PartnerForm kind="partner" /></div>
        </Pathway>

        <Pathway
          id="sponsor"
          eyebrow="Fund opportunity"
          title="Sponsor Our Programs"
          aside={
            <>
              <p>Companies, organisations and individuals can sponsor, for example as part of a corporate social responsibility (CSR) program:</p>
              <ul className="space-y-3 text-base">
                {[
                  { icon: GraduationCap, t: "Training programs", d: "Cover the cost of a cohort or a course." },
                  { icon: Trophy, t: "Scholarships", d: "Remove cost as a barrier for talented learners." },
                  { icon: Laptop, t: "Equipment", d: "Laptops, devices and connectivity for learners." },
                  { icon: Users, t: "Community projects", d: "Technology solutions built with communities." },
                ].map(({ icon: Icon, t, d }) => (
                  <li key={t} className="flex gap-3">
                    <Icon className="mt-1 size-5 shrink-0 text-accent" aria-hidden="true" />
                    <span><strong className="text-brand-900">{t}.</strong> {d}</span>
                  </li>
                ))}
              </ul>
              <p className="text-base">Tell us what you would like to support and we will prepare a sponsorship proposal with clear reporting on how your support is used. MindsNova Hub is a registered social enterprise, not a charity, so sponsorships are business partnerships rather than tax-deductible donations. We do not take online payments at this time.</p>
            </>
          }
        >
          <div className="card p-6 sm:p-8"><PartnerForm kind="sponsor" /></div>
        </Pathway>
      </div>
    </>
  );
}
