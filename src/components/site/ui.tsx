import { ArrowRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { CategoryIcon } from "@/components/Icon";
import { LogoMark } from "@/components/Logo";
import {
  EVENT_TYPES,
  PROGRAM_APPLICATION_STATUS,
  PROJECT_TYPES,
  categoryBySlug,
  resourceCategory,
  type EventType,
  type IconName,
  type ProgramApplicationStatus,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { categoryPhoto } from "@/lib/images";
import type { Event, Post, Program, Project } from "@/lib/queries";
import { formatDate, readingTime } from "@/lib/utils";

/* ---------------- Layout pieces ---------------- */

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  icon,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  icon?: IconName;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line/60 bg-[radial-gradient(70%_90%_at_0%_0%,var(--color-accent-100),transparent_65%),radial-gradient(50%_70%_at_100%_100%,#fff7e0,transparent_70%)]">
      <div className="container-page relative py-12 sm:py-16">
        <div className="max-w-3xl">
          {icon ? (
            <span className="icon-tile mb-5 bg-white shadow-soft">
              <CategoryIcon name={icon} className="size-6" />
            </span>
          ) : null}
          <p className="eyebrow-pill animate-in">{eyebrow}</p>
          <h1 className="mt-5 animate-in text-4xl font-semibold leading-[1.08] sm:text-[3.4rem]">{title}</h1>
          {intro ? <div className="lead mt-4 animate-in [animation-delay:150ms]">{intro}</div> : null}
          {children ? <div className="mt-7 animate-in [animation-delay:280ms]">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div className={cn("reveal mb-8 flex flex-col gap-5 sm:mb-10", align === "center" ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between")}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2>
        {intro ? <p className="mt-4 text-lg text-muted">{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-dashed border-line bg-white px-6 py-12 text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent-50 text-brand">
        {icon ?? <LogoMark className="size-9" />}
      </div>
      <h3 className="text-xl">{title}</h3>
      {children ? <div className="mx-auto mt-2 max-w-md text-muted">{children}</div> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-mn", className)}>
      <ReactMarkdown
        components={{
          a: ({ href, children: c }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {c}
              </a>
            );
          },
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** Paragraphs from plain text with blank-line breaks. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/**
 * Shows an uploaded photo, or a branded placeholder panel when no authentic
 * photo has been added yet. Placeholders never pretend to be real activity.
 */
export function Visual({
  src,
  alt,
  className,
  icon,
  label,
  priority = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  icon?: IconName;
  label?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} className={cn("object-cover", className)} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} />
    );
  }
  return (
    <div className={cn("relative grid place-items-center overflow-hidden bg-gradient-to-br from-brand-700 via-accent to-accent-400", className)} role="img" aria-label={label ?? ""}>
      <div className="relative flex flex-col items-center gap-3 p-6 text-center text-white">
        {icon ? (
          <span className="grid size-14 place-items-center rounded-2xl bg-white/15">
            <CategoryIcon name={icon} className="size-7" />
          </span>
        ) : (
          <LogoMark className="size-14" inverted />
        )}
        {label ? <span className="max-w-[16rem] font-display text-sm font-semibold text-white/90">{label}</span> : null}
      </div>
    </div>
  );
}

/* ---------------- Cards ---------------- */

export function StatusBadge({ status }: { status: string }) {
  const s = PROGRAM_APPLICATION_STATUS[status as ProgramApplicationStatus] ?? PROGRAM_APPLICATION_STATUS.interest;
  const tone =
    status === "open" ? "bg-accent text-white" : status === "closed" ? "bg-neutral-100 text-neutral-700" : "bg-accent-100 text-brand-800";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", tone)}>
      {status === "open" ? <span className="size-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" /> : null}
      {s.label}
    </span>
  );
}

export function ProgramCard({ program }: { program: Program }) {
  const category = categoryBySlug(program.category);
  const photo = categoryPhoto(program.category);
  return (
    <article className="card-hover group relative flex h-full flex-col overflow-hidden">
      <Visual
        src={program.imageUrl || photo?.src}
        alt={program.imageUrl ? program.imageAlt : photo?.alt}
        icon={category?.icon}
        label={category?.title}
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold">
          <Link href={`/programs/${program.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {program.title}
          </Link>
        </h3>
        <p className="mt-2 text-[0.95rem] text-muted">{program.summary}</p>
        <div className="relative z-10 mt-auto pt-6">
          <Link href={`/programs/${program.slug}`} className="btn-outline btn-sm">View details</Link>
        </div>
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: Event }) {
  const d = new Date(event.startsAt);
  return (
    <article className="card-hover relative flex gap-5 p-5">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand py-2 text-white">
        <span className="text-xs font-semibold uppercase">{formatDate(d, { month: "short", day: undefined, year: undefined })}</span>
        <span className="font-display text-2xl font-extrabold leading-none">{formatDate(d, { day: "numeric", month: undefined, year: undefined })}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">{EVENT_TYPES[event.type as EventType] ?? "Event"}</p>
        <h3 className="mt-1 text-lg font-bold">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">{event.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{event.summary}</p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{formatDate(d, { hour: "2-digit", minute: "2-digit", day: undefined, month: undefined, year: undefined })}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{event.isOnline ? "Online" : event.location || "Location to be confirmed"}</span>
        </p>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: Post }) {
  const cat = resourceCategory(post.category);
  return (
    <article className="card-hover relative flex h-full flex-col overflow-hidden">
      <Visual src={post.coverImage} alt={post.coverAlt} label={cat?.title} className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">{cat?.title ?? "Article"}</p>
        <h3 className="mt-2 text-lg font-bold">
          <Link href={`/resources/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.95rem] text-muted">{post.excerpt}</p>
        <p className="mt-auto pt-4 text-sm text-muted">
          {formatDate(post.publishAt)} · {readingTime(post.body)} min read
        </p>
        <span className="link-arrow mt-4 text-sm" aria-hidden="true">Read more <ArrowRight className="size-4" /></span>
      </div>
    </article>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card-hover relative flex h-full flex-col overflow-hidden">
      <Visual src={project.imageUrl} alt={project.imageAlt} label={PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES]} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">{PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES] ?? "Project"}</p>
        <h3 className="mt-2 text-lg font-bold">
          <Link href={`/innovation/projects/${project.slug}`} className="after:absolute after:inset-0">{project.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.95rem] text-muted">{project.summary}</p>
        {project.technologies.length ? (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-4" aria-label="Technologies used">
            {project.technologies.slice(0, 5).map((t) => (
              <li key={t} className="chip">{t}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("link-arrow", className)}>
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

export function CtaBand({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className="container-page pb-16 sm:pb-24">
      <div className="rounded-[2rem] border border-line bg-accent-50 px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-muted">{text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
