import type { MetadataRoute } from "next";
import { getPrograms, getProjects, getUpcomingEvents } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    ["", 1],
    ["/about", 0.8],
    ["/programs", 0.9],
    ["/career-talks", 0.8],
    ["/get-involved", 0.8],
    ["/events", 0.6],
    ["/contact", 0.6],
    ["/apply", 0.9],
    ["/privacy", 0.2],
    ["/terms", 0.2],
    ["/cookies", 0.2],
    ["/safeguarding", 0.3],
  ] as const;

  const [programs, projects, events] = await Promise.all([
    getPrograms(),
    getProjects(500),
    getUpcomingEvents({ limit: 200 }),
  ]);

  return [
    ...staticPages.map(([path, priority]) => ({ url: siteUrl(path), lastModified: now, priority })),
    ...programs.map((p) => ({ url: siteUrl(`/programs/${p.slug}`), lastModified: p.updatedAt, priority: 0.8 })),
    ...projects.map((p) => ({ url: siteUrl(`/innovation/projects/${p.slug}`), lastModified: p.updatedAt, priority: 0.5 })),
    ...events.map((e) => ({ url: siteUrl(`/events/${e.slug}`), lastModified: e.updatedAt, priority: 0.5 })),
  ];
}
