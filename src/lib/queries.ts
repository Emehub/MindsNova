import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, isNotNull, lte, or, sql } from "drizzle-orm";
import { db, schema } from "./db";

const { programs, events, posts, projects, impactMetrics } = schema;

export type Program = typeof programs.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Project = typeof projects.$inferSelect;

/** Wraps queries so a database outage shows empty states instead of crashing pages. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[query]", e);
    return fallback;
  }
}

/* ---------------- Programs ---------------- */

export const getPrograms = () =>
  safe(
    () => db.select().from(programs).where(eq(programs.published, true)).orderBy(asc(programs.sortOrder), asc(programs.title)),
    [] as Program[],
  );

/** Featured programs first, then any program with open applications. */
export const getFeaturedPrograms = (limit = 3) =>
  safe(
    () =>
      db
        .select()
        .from(programs)
        .where(eq(programs.published, true))
        .orderBy(
          desc(programs.featured),
          sql`CASE ${programs.applicationStatus} WHEN 'open' THEN 0 WHEN 'interest' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END`,
          asc(programs.sortOrder),
        )
        .limit(limit),
    [] as Program[],
  );

export const getProgram = (slug: string) =>
  safe(
    () => db.query.programs.findFirst({ where: and(eq(programs.slug, slug), eq(programs.published, true)) }),
    undefined,
  );

/* ---------------- Events ---------------- */

export const getUpcomingEvents = (opts: { types?: string[]; limit?: number } = {}) =>
  safe(() => {
    const now = new Date();
    const conds = [
      eq(events.published, true),
      or(gte(events.startsAt, now), and(isNotNull(events.endsAt), gte(events.endsAt, now))),
    ];
    if (opts.types?.length) conds.push(inArray(events.type, opts.types));
    return db.select().from(events).where(and(...conds)).orderBy(asc(events.startsAt)).limit(opts.limit ?? 50);
  }, [] as Event[]);

export const getPastEvents = (limit = 6) =>
  safe(
    () =>
      db
        .select()
        .from(events)
        .where(and(eq(events.published, true), lte(events.startsAt, new Date())))
        .orderBy(desc(events.startsAt))
        .limit(limit),
    [] as Event[],
  );

export const getEvent = (slug: string) =>
  safe(() => db.query.events.findFirst({ where: and(eq(events.slug, slug), eq(events.published, true)) }), undefined);

/* ---------------- Posts ---------------- */

const livePost = () => and(eq(posts.status, "published"), lte(posts.publishAt, new Date()));

export async function getPosts({ category, q, page = 1, perPage = 9 }: { category?: string; q?: string; page?: number; perPage?: number }) {
  return safe(
    async () => {
      const conds = [livePost()];
      if (category) conds.push(eq(posts.category, category));
      if (q) {
        const term = `%${q.replace(/[%_]/g, "")}%`;
        conds.push(or(ilike(posts.title, term), ilike(posts.excerpt, term), ilike(posts.body, term)));
      }
      const where = and(...conds);
      const [rows, [{ n }]] = await Promise.all([
        db
          .select()
          .from(posts)
          .where(where)
          .orderBy(desc(posts.publishAt))
          .limit(perPage)
          .offset((page - 1) * perPage),
        db.select({ n: count() }).from(posts).where(where),
      ]);
      return { rows, total: Number(n), pages: Math.max(1, Math.ceil(Number(n) / perPage)) };
    },
    { rows: [] as Post[], total: 0, pages: 1 },
  );
}

export const getPost = (slug: string) =>
  safe(() => db.query.posts.findFirst({ where: and(eq(posts.slug, slug), livePost()) }), undefined);

export const getLatestPosts = (limit = 3) =>
  safe(() => db.select().from(posts).where(livePost()).orderBy(desc(posts.publishAt)).limit(limit), [] as Post[]);

/* ---------------- Projects ---------------- */

export const getProjects = (limit = 50) =>
  safe(
    () => db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.createdAt)).limit(limit),
    [] as Project[],
  );

export const getProject = (slug: string) =>
  safe(() => db.query.projects.findFirst({ where: and(eq(projects.slug, slug), eq(projects.published, true)) }), undefined);

/* ---------------- Impact ---------------- */

/** Only verified, visible metrics with a value. Returns [] until the team enters real figures. */
export const getVerifiedImpact = () =>
  safe(
    () =>
      db
        .select()
        .from(impactMetrics)
        .where(and(eq(impactMetrics.verified, true), eq(impactMetrics.visible, true), isNotNull(impactMetrics.value)))
        .orderBy(asc(impactMetrics.sortOrder)),
    [] as (typeof impactMetrics.$inferSelect)[],
  );
