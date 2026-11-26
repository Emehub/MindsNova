import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, EventCard, PageHero, SectionHeading } from "@/components/site/ui";
import { PAGE_PHOTOS } from "@/lib/images";
import { getPastEvents, getUpcomingEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming MindsNova Hub training sessions, workshops, career talks and community events.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents(6)]);
  return (
    <>
      <PageHero image={PAGE_PHOTOS.events} eyebrow="Events" title="Learn, connect and get job-ready." intro="Training sessions, workshops, career talks with professionals and community events." />
      <section className="section pt-12">
        <div className="container-page">
          <SectionHeading title="Upcoming events" />
          {upcoming.length ? (
            <div className="grid gap-4 md:grid-cols-2">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div>
          ) : (
            <EmptyState icon={<CalendarDays className="size-7" aria-hidden="true" />} title="No upcoming events yet" action={<Link href="/#newsletter" className="btn-primary">Get notified</Link>}>
              New events are announced here and in our newsletter.
            </EmptyState>
          )}
          {past.length ? (
            <div className="mt-16">
              <SectionHeading title="Past events" />
              <div className="grid gap-4 opacity-90 md:grid-cols-2">{past.map((e) => <EventCard key={e.id} event={e} />)}</div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
