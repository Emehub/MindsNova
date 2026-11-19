# MindsNova Hub website

The public website, program application system and administration dashboard for **MindsNova Hub**, *Empowering Minds. Shaping the Future.*

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS 4, PostgreSQL (Drizzle ORM) and Nodemailer.

---

## 1. Run it on your computer

Requirements: Node.js 20 or newer. No database installation is needed for development.

```bash
cd mindsnova-hub
npm install
cp .env.example .env        # then set ADMIN_EMAIL and ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000. The admin dashboard is at http://localhost:3000/admin.

On first start the server automatically:

1. creates the database tables,
2. loads the six programs (AI talks, career readiness, mentorship, entry-level job preparation, computer literacy, workplace and corporate skills; all in "Registering interest" mode, with no dates, durations or fees), and
3. creates the first Super Administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

In development the database is **PGlite**, a full PostgreSQL engine stored in `.data/pglite`. Delete the `.data` folder to start again from empty. Only one process can open it at a time, so stop `npm run dev` before running `npm run db:*` scripts locally.

---

## 2. Go live (production)

1. **Database:** create a PostgreSQL 14+ database (for example Neon, Supabase, Render, Railway, or a managed server) and set `DATABASE_URL`.
2. **Environment:** set every variable in `.env.example` on your host. At minimum: `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, the `SMTP_*` settings, `EMAIL_FROM` and `ADMIN_NOTIFY_EMAILS`.
3. **Build and start:**
   ```bash
   npm ci
   npm run build
   npm run db:setup     # migrations, starting content and first admin
   npm start
   ```
4. **Uploads:** files uploaded in the dashboard are stored in the database (`media_blobs` table), so no persistent disk is needed.
5. **HTTPS** is required in production (session cookies are `Secure`).
6. After first sign-in, change the admin password under **Account**, then remove `ADMIN_PASSWORD` from the environment.

### Deploying on Vercel (recommended)

1. On vercel.com, **Add New → Project** and import this GitHub repository. Framework: Next.js (detected).
2. In the project, open **Storage → Create Database → Neon (Postgres)** and connect it. This sets `DATABASE_URL` automatically.
3. Under **Settings → Environment Variables** add `NEXT_PUBLIC_SITE_URL` (your site address), `ADMIN_EMAIL` and `ADMIN_PASSWORD`, plus the optional email (`SMTP_*`) settings.
4. **Deploy.** On first start the site creates its tables, loads the six programs and creates the admin account. Every push to `main` redeploys automatically.

---

## 3. Before launch: fill in your real details

All of this is done in the dashboard. No code changes are needed.

| Where | What |
|---|---|
| **Site content → Contact details** | Official email, phone, WhatsApp, address. Empty fields are hidden, never invented. |
| **Site content → Social media** | Links to your profiles. Empty links are hidden. |
| **Site content → Homepage** | Hero and community photos. Until you add real photos, a branded illustration is shown. Use authentic images, with consent for anyone pictured. |
| **Site content → About Us** | Review the wording for Who We Are, philosophy and brand meaning. |
| **Programs** | For each program, confirm format, duration and dates. Switch **Application status** to "Applications open" only when an intake is confirmed. |
| **Impact statistics** | Enter real figures and tick **Verified**. The homepage impact section stays hidden until at least one metric is verified. |
| **Users and roles** | Give each staff member their own account. |

**Legal pages** (`/privacy`, `/terms`, `/cookies`, `/safeguarding`) are written with Ghana's Data Protection Act, 2012 (Act 843) and Children's Act, 1998 (Act 560) in mind, but **must be reviewed by a qualified lawyer** before launch. Also register with the Data Protection Commission of Ghana as a data controller. Update the date in `src/components/site/LegalPage.tsx` whenever a policy changes.

---

## 4. What the site does

### Public website
Home, About Us, Our Programs (directory and a page per program), Academy, Career Talks (professionals on the job market and the workplace), Services, Get Involved (student, mentor or speaker, volunteer, partner and sponsor forms), Resources (articles with categories, search and pagination), Events, Contact, application form, application status check, and the legal pages.

### Application system
- Applicants receive a reference number (for example `MNH-7K3Q9P`) and an acknowledgement email.
- Applicants **under 18** must give a parent or guardian's details and consent. The guardian is emailed too, and receives copies of status updates.
- Admins are notified of each new application (`ADMIN_NOTIFY_EMAILS`).
- Statuses: Pending, Under review, Accepted, Not selected (rejected), Waitlisted. Each change can email the applicant, with an optional personal message, and is recorded in the application's history.
- Applicants can check their status at `/apply/status` with their reference and email.

### Administration dashboard (`/admin`)
Applications, mentors, volunteers, partners and sponsors, contact messages, newsletter subscribers (all with CSV export), programs, events, articles (draft, publish and schedule), project showcase, impact statistics, site content, media library, users and roles, email log, and basic analytics.

| Role | Can access |
|---|---|
| Super Administrator | Everything, including users and the email log |
| Content Manager | Site content, articles, events, projects, media, impact statistics, messages, newsletter, analytics |
| Program Coordinator | Programs, events, projects, applications, mentors, volunteers, partners, messages, media, analytics |
| Application Reviewer | Applications only |

Change roles in `src/lib/catalog.ts` (`ROLE_PERMISSIONS`).

### Email
With SMTP configured, emails are sent through your provider (Google Workspace, Microsoft 365, Brevo, Mailgun, Amazon SES and so on). Without it, nothing is sent but every message is recorded in **Email log**, so you can test safely.

### Security and privacy
- Passwords hashed with bcrypt. Sessions are random tokens stored hashed in the database, in `HttpOnly`, `SameSite` cookies, valid for 7 days.
- Every admin page and action checks the user's role on the server.
- Login and all public forms are rate limited. Forms also use a honeypot field, a timing check and, optionally, Cloudflare Turnstile (`TURNSTILE_*`).
- Uploads are checked by their real file type. Only PNG, JPEG, GIF, WebP and PDF are accepted (no SVG or HTML).
- CSV exports are protected against spreadsheet formula injection.
- Built-in analytics count page views by page and day only: no cookies and no IP addresses. Google Analytics (`NEXT_PUBLIC_GA_ID`) loads only after a visitor accepts analytics cookies.

### SEO
Per-page titles and descriptions, Open Graph image, `sitemap.xml`, `robots.txt`, structured data (EducationalOrganization, Course, Article, Event), clean URLs and image alt text. Add Search Console and Bing verification codes with `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`.

---

## 5. Project structure

```
src/
  app/
    (site)/            Public pages, sharing the header and footer
    admin/login        Sign in
    admin/(dash)/      Dashboard pages and content-actions.ts (server actions)
    admin/export/      CSV downloads
    api/forms/[form]   All public form submissions
    api/admin/upload   Image upload for editors
    api/track          Page view counter
    media/[id]/[name]  Serves uploaded files
  components/
    site/              Public UI (header, footer, cards, page hero)
    forms/             Public forms and the reusable FormKit
    admin/             Dashboard UI kit, editors, submissions inbox
  lib/
    catalog.ts         Program categories, statuses, form options, roles  <- edit lists here
    settings.ts        Editable site content and its defaults
    db/schema.ts       Database tables
    db/seed-data.ts    Starting programs and impact metrics
    auth.ts email.ts spam.ts uploads.ts validation.ts queries.ts
drizzle/               SQL migrations
scripts/               migrate, seed, create-admin
```

### Common changes
- **Add a program category or resource category:** add it to `src/lib/catalog.ts`. It appears in menus, filters, forms and the admin automatically.
- **Add a program, event, article or project:** use the dashboard.
- **Change the database:** edit `src/lib/db/schema.ts`, run `npm run db:generate` and commit the new file in `drizzle/`. Migrations run automatically on start.
- **Create or reset an admin from the command line:** `npm run admin:create -- --email name@org.com --name "Name" --role super_admin`.

---

## 6. Ready for what comes next

- **Learning platform (LMS):** `programs` is the course catalogue and accepted applications are ready to become enrollments. Add `students`, `enrollments`, `lessons`, `assignments`, `quiz_attempts` and `certificates` tables that reference `programs.id`, with student sign-in alongside the existing admin auth. The Academy page already describes the platform as in development.
- **Payments:** `programs.fee` exists but is not displayed. Add a provider (for example Paystack or Flutterwave for Ghana) once it is approved. The site says clearly that no online payments are taken.
- **Newsletter service:** export subscribers as CSV today. To sync automatically, call your provider's API in `handleNewsletter` in `src/app/api/forms/[form]/route.ts`.
- **Digital certificates and external learning platforms** fit the same pattern: a table referencing `applications` or `programs`, and a page under `/academy`.

---

## 7. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with automatic database setup |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript checks |
| `npm run db:generate` | Create a migration after schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:setup` | Migrations, starting content and first admin |
| `npm run admin:create` | Create or reset an administrator |
