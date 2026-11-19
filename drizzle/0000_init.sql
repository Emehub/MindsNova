CREATE TABLE "application_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"notified" boolean DEFAULT false NOT NULL,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"age_range" text NOT NULL,
	"country" text NOT NULL,
	"region" text NOT NULL,
	"education" text NOT NULL,
	"occupation" text NOT NULL,
	"program_slug" text NOT NULL,
	"program_title" text NOT NULL,
	"experience" text NOT NULL,
	"motivation" text NOT NULL,
	"accessibility_needs" text DEFAULT '' NOT NULL,
	"is_minor" boolean DEFAULT false NOT NULL,
	"guardian_name" text DEFAULT '' NOT NULL,
	"guardian_email" text DEFAULT '' NOT NULL,
	"guardian_phone" text DEFAULT '' NOT NULL,
	"guardian_consent" boolean DEFAULT false NOT NULL,
	"privacy_consent" boolean NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"internal_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text NOT NULL,
	"error" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"summary" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"location" text DEFAULT '' NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"registration_url" text DEFAULT '' NOT NULL,
	"program_id" integer,
	"image_url" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "impact_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"value" integer,
	"suffix" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "impact_metrics_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"stored_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"alt" text,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_stored_name_unique" UNIQUE("stored_name")
);
--> statement-breakpoint
CREATE TABLE "mentors" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"background" text NOT NULL,
	"expertise" text NOT NULL,
	"years_experience" text NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"availability" text NOT NULL,
	"linkedin" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"internal_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"organization" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"org_type" text NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"internal_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"cover_image" text DEFAULT '' NOT NULL,
	"cover_alt" text DEFAULT '' NOT NULL,
	"author_name" text DEFAULT 'MindsNova Hub' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"summary" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"audience" text DEFAULT '' NOT NULL,
	"format" text DEFAULT '' NOT NULL,
	"duration" text DEFAULT '' NOT NULL,
	"eligibility" text DEFAULT '' NOT NULL,
	"outcomes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"curriculum" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"application_status" text DEFAULT 'interest' NOT NULL,
	"application_deadline" date,
	"start_date" date,
	"fee" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"summary" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"outcomes" text DEFAULT '' NOT NULL,
	"team" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"project_url" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'subscribed' NOT NULL,
	"token" text NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "subscribers_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skills" text DEFAULT '' NOT NULL,
	"availability" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"internal_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_email_idx" ON "applications" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "page_views_path_day_idx" ON "page_views" USING btree ("path","day");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "posts_publish_idx" ON "posts" USING btree ("publish_at");--> statement-breakpoint
CREATE INDEX "programs_category_idx" ON "programs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");