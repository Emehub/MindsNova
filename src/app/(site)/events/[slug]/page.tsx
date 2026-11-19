import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown, Visual } from "@/components/site/ui";
import { EVENT_TYPES, SITE, type EventType } from "@/lib/catalog";
import { getEvent } from "@/lib/queries";
import { formatDate, siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getEvent((await params).slug);
  if (!e) return { title: "Event not found" };
  return { title: e.title, description: e.summary, alternates: { canonical: `/events/${e.slug}` } };
}

export default async function EventPage({ params }: Props) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();
  const isPast = (event.endsAt ?? event.startsAt) < new Date();
  const time = (d: Date) => formatDate(d, { hour: "2-digit", minute: "2-digit", day: undefined, month: undefined, year: undefined });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.startsAt.toISOString(),
    endDate: event.endsAt?.toISOString(),
    eventAttendanceMode: event.isOnline ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: event.isOnline
      ? { "@type": "VirtualLocation", url: event.registrationUrl || siteUrl(`/events/${event.slug}`) }
      : { "@type": "Place", name: event.location || "Accra, Ghana", address: event.location || "Accra, Ghana" },
    organizer: { "@type": "Organization", name: SITE.name, url: siteUrl() },
  };

  return (
    <article className="container-page max-w-4xl py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/events" className="link-arrow text-sm"><ArrowLeft className="size-4" aria-hidden="true" /> All events</Link>
      <p className="eyebrow mt-8">{EVENT_TYPES[event.type as EventType] ?? "Event"}</p>
      <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{event.title}</h1>
      <p className="lead mt-5">{event.summary}</p>

      <dl className="mt-8 grid gap-4 rounded-[var(--radius-card)] bg-accent-50 p-6 sm:grid-cols-3">
        <div className="flex gap-3"><CalendarDays className="size-5 shrink-0 text-brand" aria-hidden="true" /><div><dt className="text-sm text-muted">Date</dt><dd className="font-semibold text-brand-900">{formatDate(event.startsAt)}</dd></div></div>
        <div className="flex gap-3"><Clock className="size-5 shrink-0 text-brand" aria-hidden="true" /><div><dt className="text-sm text-muted">Time (Ghana)</dt><dd className="font-semibold text-brand-900">{time(event.startsAt)}{event.endsAt ? ` to ${time(event.endsAt)}` : ""}</dd></div></div>
        <div className="flex gap-3"><MapPin className="size-5 shrink-0 text-brand" aria-hidden="true" /><div><dt className="text-sm text-muted">Location</dt><dd className="font-semibold text-brand-900">{event.isOnline ? "Online" : event.location || "To be confirmed"}</dd></div></div>
      </dl>

      {isPast ? (
        <p className="mt-6 rounded-xl border border-line px-4 py-3 text-muted">This event has ended.</p>
      ) : event.registrationUrl ? (
        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">Register for this event <ExternalLink className="size-4" aria-hidden="true" /></a>
      ) : null}

      {event.imageUrl ? <Visual src={event.imageUrl} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--radius-card)]" /> : null}
      {event.description ? <Markdown className="mt-10">{event.description}</Markdown> : null}
    </article>
  );
}
