import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown, Visual } from "@/components/site/ui";
import { PROJECT_TYPES } from "@/lib/catalog";
import { getProject } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return { title: "Project not found" };
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/innovation/projects/${p.slug}` },
    openGraph: { images: p.imageUrl ? [p.imageUrl] : undefined },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const type = PROJECT_TYPES[project.type as keyof typeof PROJECT_TYPES] ?? "Project";

  return (
    <article className="container-page max-w-4xl py-12 sm:py-16">
      <Link href="/innovation#showcase" className="link-arrow text-sm"><ArrowLeft className="size-4" aria-hidden="true" /> Project showcase</Link>
      <p className="eyebrow mt-8">{type}</p>
      <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{project.title}</h1>
      <p className="lead mt-5">{project.summary}</p>

      <Visual src={project.imageUrl} alt={project.imageAlt} label={type} className="mt-10 aspect-[16/9] w-full rounded-[var(--radius-card)] shadow-soft" priority />

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_16rem]">
        <div className="min-w-0">
          {project.description ? <Markdown>{project.description}</Markdown> : null}
          {project.outcomes ? (
            <section className="mt-10 rounded-[var(--radius-card)] bg-accent-50 p-6">
              <h2 className="text-xl font-extrabold">Outcomes</h2>
              <Markdown className="mt-3">{project.outcomes}</Markdown>
            </section>
          ) : null}
        </div>
        <aside className="space-y-6">
          {project.technologies.length ? (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand">Technologies used</h2>
              <ul className="mt-3 flex flex-wrap gap-2">{project.technologies.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
            </div>
          ) : null}
          {project.team ? (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand">Team</h2>
              <p className="mt-2 text-muted">{project.team}</p>
            </div>
          ) : null}
          {project.projectUrl ? (
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
              View project <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
