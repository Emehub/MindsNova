/**
 * Database schema (PostgreSQL).
 *
 * The same schema runs on PGlite (local development, zero install) and on
 * any PostgreSQL server in production. Generate migrations with
 * `npm run db:generate` after editing this file.
 *
 * LMS readiness: `programs` is the course catalogue. A future LMS adds
 * `students`, `enrollments`, `lessons`, `assignments`, `quiz_attempts` and
 * `certificates` tables that reference `programs.id` and `applications.id`
 * (an accepted application becomes an enrollment).
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** super_admin | content_manager | program_coordinator | application_reviewer */
  role: text("role").notNull(),
  active: boolean("active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 hash of the session token. The raw token only lives in the cookie. */
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Key/value store for editable site content (About page, contact details, social links...). */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updatedAt(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  storedName: text("stored_name").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  alt: text("alt"),
  uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const impactMetrics = pgTable("impact_metrics", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  value: integer("value"),
  suffix: text("suffix").default("").notNull(),
  /** Only verified metrics are ever shown publicly. */
  verified: boolean("verified").default(false).notNull(),
  visible: boolean("visible").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: updatedAt(),
});

/* ------------------------------------------------------------------ */
/* Programs, events, projects, articles                                */
/* ------------------------------------------------------------------ */

export type CurriculumModule = { title: string; description?: string };

export const programs = pgTable(
  "programs",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    /** Category slug, see src/lib/catalog.ts */
    category: text("category").notNull(),
    summary: text("summary").notNull(),
    description: text("description").default("").notNull(),
    audience: text("audience").default("").notNull(),
    /** e.g. "In person, Accra" or "Online". Empty means "to be confirmed". */
    format: text("format").default("").notNull(),
    /** Empty means "to be confirmed". Never fill with a guess. */
    duration: text("duration").default("").notNull(),
    eligibility: text("eligibility").default("").notNull(),
    outcomes: jsonb("outcomes").$type<string[]>().default([]).notNull(),
    curriculum: jsonb("curriculum").$type<CurriculumModule[]>().default([]).notNull(),
    topics: jsonb("topics").$type<string[]>().default([]).notNull(),
    /** interest | open | closed | in_progress | completed */
    applicationStatus: text("application_status").default("interest").notNull(),
    applicationDeadline: date("application_deadline"),
    startDate: date("start_date"),
    /** Kept for a future payment integration; not displayed until fees are confirmed. */
    fee: text("fee").default("").notNull(),
    imageUrl: text("image_url").default("").notNull(),
    imageAlt: text("image_alt").default("").notNull(),
    featured: boolean("featured").default(false).notNull(),
    published: boolean("published").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("programs_category_idx").on(t.category)],
);

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /** workshop | bootcamp | hackathon | info_session | webinar | training | community | other */
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  description: text("description").default("").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  location: text("location").default("").notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  registrationUrl: text("registration_url").default("").notNull(),
  programId: integer("program_id").references(() => programs.id, { onDelete: "set null" }),
  imageUrl: text("image_url").default("").notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /** student | community | ai | hackathon | startup */
  type: text("type").notNull(),
  summary: text("summary").notNull(),
  description: text("description").default("").notNull(),
  technologies: jsonb("technologies").$type<string[]>().default([]).notNull(),
  outcomes: text("outcomes").default("").notNull(),
  /** Only add names with documented consent (and guardian consent for minors). */
  team: text("team").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  imageAlt: text("image_alt").default("").notNull(),
  projectUrl: text("project_url").default("").notNull(),
  /** Approved projects only appear when published. */
  published: boolean("published").default(false).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    excerpt: text("excerpt").notNull(),
    /** Markdown */
    body: text("body").notNull(),
    coverImage: text("cover_image").default("").notNull(),
    coverAlt: text("cover_alt").default("").notNull(),
    authorName: text("author_name").default("MindsNova Hub").notNull(),
    /** draft | published. A published post with a future publishAt is "scheduled". */
    status: text("status").default("draft").notNull(),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("posts_category_idx").on(t.category), index("posts_publish_idx").on(t.publishAt)],
);

/* ------------------------------------------------------------------ */
/* Submissions                                                         */
/* ------------------------------------------------------------------ */

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    ageRange: text("age_range").notNull(),
    country: text("country").notNull(),
    region: text("region").notNull(),
    education: text("education").notNull(),
    occupation: text("occupation").notNull(),
    /** Program slug, or "mentorship" / "undecided" */
    programSlug: text("program_slug").notNull(),
    programTitle: text("program_title").notNull(),
    experience: text("experience").notNull(),
    motivation: text("motivation").notNull(),
    accessibilityNeeds: text("accessibility_needs").default("").notNull(),
    isMinor: boolean("is_minor").default(false).notNull(),
    guardianName: text("guardian_name").default("").notNull(),
    guardianEmail: text("guardian_email").default("").notNull(),
    guardianPhone: text("guardian_phone").default("").notNull(),
    guardianConsent: boolean("guardian_consent").default(false).notNull(),
    privacyConsent: boolean("privacy_consent").notNull(),
    /** pending | under_review | accepted | rejected | waitlisted */
    status: text("status").default("pending").notNull(),
    internalNotes: text("internal_notes").default("").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("applications_status_idx").on(t.status), index("applications_email_idx").on(t.email)],
);

export const applicationEvents = pgTable("application_events", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  note: text("note").default("").notNull(),
  notified: boolean("notified").default(false).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  background: text("background").notNull(),
  expertise: text("expertise").notNull(),
  yearsExperience: text("years_experience").notNull(),
  interests: jsonb("interests").$type<string[]>().default([]).notNull(),
  availability: text("availability").notNull(),
  linkedin: text("linkedin").default("").notNull(),
  /** new | contacted | approved | active | inactive */
  status: text("status").default("new").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  createdAt: createdAt(),
});

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default("").notNull(),
  location: text("location").default("").notNull(),
  interests: jsonb("interests").$type<string[]>().default([]).notNull(),
  skills: text("skills").default("").notNull(),
  availability: text("availability").default("").notNull(),
  message: text("message").default("").notNull(),
  /** new | contacted | active | inactive */
  status: text("status").default("new").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  createdAt: createdAt(),
});

export const partnerInquiries = pgTable("partner_inquiries", {
  id: serial("id").primaryKey(),
  /** partner | sponsor */
  kind: text("kind").notNull(),
  organization: text("organization").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default("").notNull(),
  orgType: text("org_type").notNull(),
  interests: jsonb("interests").$type<string[]>().default([]).notNull(),
  message: text("message").notNull(),
  /** new | in_discussion | confirmed | declined | archived */
  status: text("status").default("new").notNull(),
  internalNotes: text("internal_notes").default("").notNull(),
  createdAt: createdAt(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  /** new | read | replied | archived */
  status: text("status").default("new").notNull(),
  createdAt: createdAt(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").default("").notNull(),
  interests: jsonb("interests").$type<string[]>().default([]).notNull(),
  /** subscribed | unsubscribed */
  status: text("status").default("subscribed").notNull(),
  /** Random token used for one-click unsubscribe links. */
  token: text("token").notNull().unique(),
  source: text("source").default("website").notNull(),
  createdAt: createdAt(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

/** Every outgoing email, sent or not. Useful for audit and for development without SMTP. */
export const emailLog = pgTable("email_log", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  /** sent | failed | not_configured */
  status: text("status").notNull(),
  error: text("error").default("").notNull(),
  createdAt: createdAt(),
});

/** Privacy friendly page view counts: path and day only, no IP, no cookies. */
export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    day: date("day").notNull(),
    views: integer("views").default(0).notNull(),
  },
  (t) => [uniqueIndex("page_views_path_day_idx").on(t.path, t.day)],
);

/** Fixed-window rate limiting for public forms and login. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").default(0).notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
