"use server";

/**
 * Server actions for content editors: programs, events, articles and projects.
 * Every action checks the editor's role before touching the database.
 */
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { EVENT_TYPES, PROGRAM_APPLICATION_STATUS, PROGRAM_CATEGORIES, PROJECT_TYPES, RESOURCE_CATEGORIES } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { lines, slugify } from "@/lib/utils";

const str = (fd: FormData, k: string, max = 20000) => String(fd.get(k) ?? "").trim().slice(0, max);
const bool = (fd: FormData, k: string) => fd.get(k) === "on";
const dateOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
};
/** datetime-local values are entered in Ghana time (GMT, no daylight saving). */
const dateTimeOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (!v) return null;
  const d = new Date(v.length === 16 ? `${v}:00Z` : v);
  return isNaN(d.getTime()) ? null : d;
};
const safeUrl = (v: string) => (v === "" || v.startsWith("/") || /^https?:\/\//.test(v) ? v : "");

type SlugTable = typeof schema.programs | typeof schema.events | typeof schema.posts | typeof schema.projects;

async function uniqueSlug(table: SlugTable, wanted: string, id?: number) {
  const base = slugify(wanted) || "item";
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const clash = await db
      .select({ id: table.id })
      .from(table)
      .where(id ? and(eq(table.slug, slug), ne(table.id, id)) : eq(table.slug, slug))
      .limit(1);
    if (!clash.length) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

function back(path: string, error: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(error)}`);
}

function refreshSite() {
  revalidatePath("/", "layout");
}

/* ---------------- Programs ---------------- */

export async function saveProgram(fd: FormData) {
  await requireUser("programs");
  const id = Number(fd.get("id")) || undefined;
  const formPath = id ? `/admin/programs/${id}` : "/admin/programs/new";
  const title = str(fd, "title", 200);
  const category = str(fd, "category");
  const summary = str(fd, "summary", 400);
  if (!title || !summary) back(formPath, "Title and summary are required.");
  if (!PROGRAM_CATEGORIES.some((c) => c.slug === category)) back(formPath, "Choose a category.");
  const applicationStatus = str(fd, "applicationStatus");
  if (!(applicationStatus in PROGRAM_APPLICATION_STATUS)) back(formPath, "Choose an application status.");

  const values = {
    title,
    category,
    summary,
    slug: await uniqueSlug(schema.programs, str(fd, "slug") || title, id),
    description: str(fd, "description"),
    audience: str(fd, "audience", 300),
    format: str(fd, "format", 200),
    duration: str(fd, "duration", 120),
    eligibility: str(fd, "eligibility", 2000),
    outcomes: lines(str(fd, "outcomes")),
    curriculum: lines(str(fd, "curriculum")).map((l) => {
      const [t, ...rest] = l.split("|");
      return { title: t.trim(), description: rest.join("|").trim() || undefined };
    }),
    topics: lines(str(fd, "topics")),
    applicationStatus,
    applicationDeadline: dateOrNull(fd, "applicationDeadline"),
    startDate: dateOrNull(fd, "startDate"),
    imageUrl: safeUrl(str(fd, "imageUrl", 500)),
    imageAlt: str(fd, "imageAlt", 300),
    featured: bool(fd, "featured"),
    published: bool(fd, "published"),
    sortOrder: Number(fd.get("sortOrder")) || 0,
    updatedAt: new Date(),
  };
  if (values.imageUrl && !values.imageAlt) back(formPath, "Add alt text describing the image, for visitors using screen readers.");

  let savedId = id;
  if (id) await db.update(schema.programs).set(values).where(eq(schema.programs.id, id));
  else savedId = (await db.insert(schema.programs).values(values).returning({ id: schema.programs.id }))[0].id;
  refreshSite();
  redirect(`/admin/programs/${savedId}?ok=1`);
}

export async function deleteProgram(fd: FormData) {
  await requireUser("programs");
  await db.delete(schema.programs).where(eq(schema.programs.id, Number(fd.get("id"))));
  refreshSite();
  redirect("/admin/programs?ok=deleted");
}

/* ---------------- Events ---------------- */

export async function saveEvent(fd: FormData) {
  await requireUser("events");
  const id = Number(fd.get("id")) || undefined;
  const formPath = id ? `/admin/events/${id}` : "/admin/events/new";
  const title = str(fd, "title", 200);
  const type = str(fd, "type");
  const startsAt = dateTimeOrNull(fd, "startsAt");
  if (!title || !str(fd, "summary")) back(formPath, "Title and summary are required.");
  if (!(type in EVENT_TYPES)) back(formPath, "Choose an event type.");
  if (!startsAt) back(formPath, "Enter a start date and time.");
  const endsAt = dateTimeOrNull(fd, "endsAt");
  if (endsAt && endsAt < startsAt) back(formPath, "The end time must be after the start time.");
  const programId = Number(fd.get("programId")) || null;

  const values = {
    title,
    type,
    startsAt,
    endsAt,
    programId,
    slug: await uniqueSlug(schema.events, str(fd, "slug") || `${title}-${startsAt.toISOString().slice(0, 10)}`, id),
    summary: str(fd, "summary", 400),
    description: str(fd, "description"),
    location: str(fd, "location", 300),
    isOnline: bool(fd, "isOnline"),
    registrationUrl: safeUrl(str(fd, "registrationUrl", 500)),
    imageUrl: safeUrl(str(fd, "imageUrl", 500)),
    published: bool(fd, "published"),
    updatedAt: new Date(),
  };
  let savedId = id;
  if (id) await db.update(schema.events).set(values).where(eq(schema.events.id, id));
  else savedId = (await db.insert(schema.events).values(values).returning({ id: schema.events.id }))[0].id;
  refreshSite();
  redirect(`/admin/events/${savedId}?ok=1`);
}

export async function deleteEvent(fd: FormData) {
  await requireUser("events");
  await db.delete(schema.events).where(eq(schema.events.id, Number(fd.get("id"))));
  refreshSite();
  redirect("/admin/events?ok=deleted");
}

/* ---------------- Posts ---------------- */

export async function savePost(fd: FormData) {
  const user = await requireUser("posts");
  const id = Number(fd.get("id")) || undefined;
  const formPath = id ? `/admin/posts/${id}` : "/admin/posts/new";
  const title = str(fd, "title", 200);
  const category = str(fd, "category");
  const body = str(fd, "body", 200000);
  if (!title || !body) back(formPath, "Title and article body are required.");
  if (!RESOURCE_CATEGORIES.some((c) => c.slug === category)) back(formPath, "Choose a category.");
  const status = fd.get("intent") === "publish" ? "published" : fd.get("intent") === "draft" ? "draft" : str(fd, "status") === "published" ? "published" : "draft";
  let publishAt = dateTimeOrNull(fd, "publishAt");
  if (status === "published" && !publishAt) publishAt = new Date();

  const values = {
    title,
    category,
    body,
    status,
    publishAt,
    slug: await uniqueSlug(schema.posts, str(fd, "slug") || title, id),
    excerpt: str(fd, "excerpt", 500) || body.replace(/[#*_>`[\]()]/g, "").slice(0, 200),
    coverImage: safeUrl(str(fd, "coverImage", 500)),
    coverAlt: str(fd, "coverAlt", 300),
    authorName: str(fd, "authorName", 120) || user.name,
    updatedAt: new Date(),
  };
  let savedId = id;
  if (id) await db.update(schema.posts).set(values).where(eq(schema.posts.id, id));
  else savedId = (await db.insert(schema.posts).values(values).returning({ id: schema.posts.id }))[0].id;
  refreshSite();
  redirect(`/admin/posts/${savedId}?ok=1`);
}

export async function deletePost(fd: FormData) {
  await requireUser("posts");
  await db.delete(schema.posts).where(eq(schema.posts.id, Number(fd.get("id"))));
  refreshSite();
  redirect("/admin/posts?ok=deleted");
}

/* ---------------- Projects ---------------- */

export async function saveProject(fd: FormData) {
  await requireUser("projects");
  const id = Number(fd.get("id")) || undefined;
  const formPath = id ? `/admin/projects/${id}` : "/admin/projects/new";
  const title = str(fd, "title", 200);
  const type = str(fd, "type");
  if (!title || !str(fd, "summary")) back(formPath, "Title and summary are required.");
  if (!(type in PROJECT_TYPES)) back(formPath, "Choose a project type.");
  const values = {
    title,
    type,
    slug: await uniqueSlug(schema.projects, str(fd, "slug") || title, id),
    summary: str(fd, "summary", 400),
    description: str(fd, "description"),
    technologies: str(fd, "technologies").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20),
    outcomes: str(fd, "outcomes"),
    team: str(fd, "team", 500),
    imageUrl: safeUrl(str(fd, "imageUrl", 500)),
    imageAlt: str(fd, "imageAlt", 300),
    projectUrl: safeUrl(str(fd, "projectUrl", 500)),
    published: bool(fd, "published"),
    updatedAt: new Date(),
  };
  if (values.imageUrl && !values.imageAlt) back(formPath, "Add alt text describing the image.");
  let savedId = id;
  if (id) await db.update(schema.projects).set(values).where(eq(schema.projects.id, id));
  else savedId = (await db.insert(schema.projects).values(values).returning({ id: schema.projects.id }))[0].id;
  refreshSite();
  redirect(`/admin/projects/${savedId}?ok=1`);
}

export async function deleteProject(fd: FormData) {
  await requireUser("projects");
  await db.delete(schema.projects).where(eq(schema.projects.id, Number(fd.get("id"))));
  refreshSite();
  redirect("/admin/projects?ok=deleted");
}
