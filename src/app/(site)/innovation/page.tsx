import { ArrowRight, Bot, Building2, Lightbulb, Rocket, School, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, EmptyState, EventCard, PageHero, ProjectCard, SectionHeading } from "@/components/site/ui";
import { getProjects, getUpcomingEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Innovation Hub",
  description:
    "The MindsNova Innovation Hub: innovation challenges, hackathons, student and community technology projects, AI innovation and support for young entrepreneurs in Ghana.",
  alternates: { canonical: "/innovation" },
};

const AREAS = [
  { icon: Trophy, title: "Innovation challenges", text: "Themed challenges that invite young people to design solutions to real problems." },
  { icon: Rocket, title: "Hackathons", text: "Team events where ideas become working prototypes in a short, focused sprint." },
  { icon: School, title: "Student projects", text: "Portfolio projects that learners build during and after our programs." },
  { icon: Building2, title: "Community technology projects", text: "Technology developed with and for local communities, schools and organisations." },
  { icon: Bot, title: "AI innovation", text: "Responsible, practical uses of artificial intelligence for African contexts." },
  { icon: Lightbulb, title: "Entrepreneurship and startup ideas", text: "Support to test ideas, build business models and pitch with confidence." },
  { icon: Users, title: "Collaboration opportunities", text: "Partners, mentors and organisations co-creating solutions with our innovators." },
];

export default async function InnovationPage() {
  const [projects, challenges] = await Promise.all([
    getProjects(),
    getUpcomingEvents({ types: ["hackathon", "innovation_challenge"], limit: 4 }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Innovation Hub"
        title="A place to experiment, create and solve real problems."
        intro="The Innovation Hub is where learning turns into building. Young innovators work together, test ideas and use technology to respond to challenges in their communities and beyond."
      >
        <div className="flex flex-wrap gap-3">
          <a href="#showcase" className="btn-primary">See the project showcase</a>
          <Link href="/get-involved#partner" className="btn-outline">Collaborate with us</Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="What happens here" title="From spark to solution" intro="The Innovation Hub brings together creativity, technical skill and entrepreneurship." />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className={`reveal card p-6 ${i === AREAS.length - 1 ? "lg:col-span-3 sm:col-span-2" : ""}`}>
                <span className="icon-tile"><Icon className="size-6" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-accent-50" id="challenges">
        <div className="container-page">
          <SectionHeading eyebrow="Challenges and hackathons" title="Upcoming challenges" />
          {challenges.length ? (
            <div className="grid gap-4 md:grid-cols-2">{challenges.map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <EmptyState
              icon={<Trophy className="size-7" aria-hidden="true" />}
              title="No challenges announced yet"
              action={<Link href="/#newsletter" className="btn-primary">Get notified</Link>}
            >
              Innovation challenges and hackathons are announced here first. Subscribe to hear when the next one opens.
            </EmptyState>
          )}
        </div>
      </section>

      <section className="section" id="showcase">
        <div className="container-page">
          <SectionHeading
            eyebrow="Project showcase"
            title="Built by our innovators"
            intro="Approved projects from our learners and community, with the technologies used and what they achieved."
          />
          {projects.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => <div key={p.id} className="reveal"><ProjectCard project={p} /></div>)}
            </div>
          ) : (
            <EmptyState title="The showcase opens with our first cohort">
              Projects will appear here once our innovators have built them and they have been reviewed and approved for publication.
            </EmptyState>
          )}
        </div>
      </section>

      <CtaBand title="Have a problem worth solving?" text="Whether you are a young innovator, a mentor or an organisation with a challenge, we would love to work with you.">
        <Link href="/apply?program=tech-entrepreneurship-and-innovation" className="btn-primary">Join as an innovator <ArrowRight className="size-4" aria-hidden="true" /></Link>
        <Link href="/get-involved#partner" className="btn-outline">Bring a challenge</Link>
      </CtaBand>
    </>
  );
}
