import { desc, eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { Badge, Flash, PageHeader, Panel, Textarea, statusTone } from "@/components/admin/kit";
import { requireUser } from "@/lib/auth";
import { AGE_RANGES, APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { applicationStatusEmail, sendMail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

async function changeStatus(formData: FormData) {
  "use server";
  const user = await requireUser("applications");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as ApplicationStatus;
  const note = String(formData.get("note") || "").trim().slice(0, 3000);
  const notify = formData.get("notify") === "on";
  if (!(status in APPLICATION_STATUSES)) return;
  const app = await db.query.applications.findFirst({ where: eq(schema.applications.id, id) });
  if (!app) return;

  await db.update(schema.applications).set({ status, updatedAt: new Date() }).where(eq(schema.applications.id, id));
  let notified = false;
  if (notify) {
    const mail = applicationStatusEmail(app, status, note || undefined);
    notified = await sendMail({ to: app.email, ...mail });
    // Keep guardians informed for under-18 applicants.
    if (app.isMinor && app.guardianEmail) await sendMail({ to: app.guardianEmail, ...mail });
  }
  await db.insert(schema.applicationEvents).values({ applicationId: id, fromStatus: app.status, toStatus: status, note, notified: notify && notified, userId: user.id });
  revalidatePath(`/admin/applications/${id}`);
  redirect(`/admin/applications/${id}?ok=${notify ? (notified ? "notified" : "saved-email-pending") : "saved"}`);
}

async function saveNotes(formData: FormData) {
  "use server";
  await requireUser("applications");
  const id = Number(formData.get("id"));
  await db.update(schema.applications).set({ internalNotes: String(formData.get("internalNotes") || "").slice(0, 10000) }).where(eq(schema.applications.id, id));
  redirect(`/admin/applications/${id}?ok=notes`);
}

async function deleteApplication(formData: FormData) {
  "use server";
  await requireUser("users"); // Super Administrators only (data deletion requests).
  await db.delete(schema.applications).where(eq(schema.applications.id, Number(formData.get("id"))));
  redirect("/admin/applications");
}

const OK: Record<string, string> = {
  saved: "Status updated.",
  notified: "Status updated and the applicant has been emailed.",
  "saved-email-pending": "Status updated. The email could not be sent (check the Email log and SMTP settings).",
  notes: "Notes saved.",
};

export default async function ApplicationDetail({ params, searchParams }: Props) {
  const user = await requireUser("applications");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const app = await db.query.applications.findFirst({ where: eq(schema.applications.id, id) });
  if (!app) notFound();
  const { ok } = await searchParams;
  const history = await db
    .select({ e: schema.applicationEvents, by: schema.users.name })
    .from(schema.applicationEvents)
    .leftJoin(schema.users, eq(schema.users.id, schema.applicationEvents.userId))
    .where(eq(schema.applicationEvents.applicationId, id))
    .orderBy(desc(schema.applicationEvents.createdAt));

  const rows: [string, string][] = [
    ["Reference", app.reference],
    ["Email", app.email],
    ["Phone", app.phone],
    ["Age range", AGE_RANGES.find((a) => a.value === app.ageRange)?.label ?? app.ageRange],
    ["Location", `${app.region}, ${app.country}`],
    ["Education", app.education],
    ["Occupation", app.occupation],
    ["Experience", app.experience],
    ["Submitted", formatDateTime(app.createdAt)],
  ];

  return (
    <>
      <PageHeader
        back={{ href: "/admin/applications", label: "Applications" }}
        title={app.fullName}
        description={<>Applied to <strong className="text-brand-900">{app.programTitle}</strong></>}
        actions={<Badge tone={statusTone(app.status)}>{APPLICATION_STATUSES[app.status as ApplicationStatus]}</Badge>}
      />
      <Flash ok={ok ? OK[ok] : undefined} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Applicant details">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k}><dt className="text-sm text-muted">{k}</dt><dd className="font-medium break-words">{k === "Email" ? <a className="link" href={`mailto:${v}`}>{v}</a> : v}</dd></div>
              ))}
            </dl>
          </Panel>

          {app.isMinor ? (
            <Panel className="border-accent-200 bg-accent-50">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 size-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <h2 className="font-bold">Under 18: parent or guardian</h2>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 text-sm">
                    <div><dt className="text-muted">Name</dt><dd className="font-medium">{app.guardianName || "Not given"}</dd></div>
                    <div><dt className="text-muted">Consent recorded</dt><dd className="font-medium">{app.guardianConsent ? "Yes, on the application form" : "No"}</dd></div>
                    <div><dt className="text-muted">Email</dt><dd className="font-medium break-words">{app.guardianEmail || "Not given"}</dd></div>
                    <div><dt className="text-muted">Phone</dt><dd className="font-medium">{app.guardianPhone || "Not given"}</dd></div>
                  </dl>
                  <p className="mt-3 text-sm text-muted">Confirm consent directly with the guardian before the applicant takes part. Status emails are copied to the guardian.</p>
                </div>
              </div>
            </Panel>
          ) : null}

          <Panel title="Motivation">
            <p className="whitespace-pre-line">{app.motivation}</p>
          </Panel>
          {app.accessibilityNeeds ? (
            <Panel title="Accessibility or learning support (confidential)">
              <p className="whitespace-pre-line">{app.accessibilityNeeds}</p>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Panel title="Update status">
            <form action={changeStatus} className="space-y-4">
              <input type="hidden" name="id" value={app.id} />
              <fieldset>
                <legend className="label">New status</legend>
                <div className="grid gap-2">
                  {(Object.keys(APPLICATION_STATUSES) as ApplicationStatus[]).map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3 py-2 has-[:checked]:border-brand has-[:checked]:bg-accent-50">
                      <input type="radio" name="status" value={s} defaultChecked={s === app.status} className="accent-brand" required />
                      {APPLICATION_STATUSES[s]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Textarea name="note" label="Message to applicant (optional)" rows={3} hint="Included in the notification email, for example next steps or dates." />
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="notify" defaultChecked className="size-4 accent-brand" /> Email the applicant about this change
              </label>
              <SubmitButton variant="primary">Save status</SubmitButton>
            </form>
          </Panel>

          <Panel title="Internal notes">
            <form action={saveNotes} className="space-y-3">
              <input type="hidden" name="id" value={app.id} />
              <Textarea name="internalNotes" label="Only visible to staff" defaultValue={app.internalNotes} rows={5} />
              <SubmitButton variant="outline">Save notes</SubmitButton>
            </form>
          </Panel>

          <Panel title="History">
            <ol className="space-y-3 text-sm">
              {history.map(({ e, by }) => (
                <li key={e.id} className="border-l-2 border-accent pl-3">
                  <p className="font-semibold">{e.fromStatus ? `${APPLICATION_STATUSES[e.fromStatus as ApplicationStatus] ?? e.fromStatus} → ` : ""}{APPLICATION_STATUSES[e.toStatus as ApplicationStatus] ?? e.toStatus}</p>
                  <p className="text-muted">{formatDateTime(e.createdAt)}{by ? ` · ${by}` : ""}{e.notified ? " · applicant emailed" : ""}</p>
                  {e.note ? <p className="mt-1 whitespace-pre-line">{e.note}</p> : null}
                </li>
              ))}
            </ol>
          </Panel>

          {user.role === "super_admin" ? (
            <form action={deleteApplication}>
              <input type="hidden" name="id" value={app.id} />
              <ConfirmButton message="Permanently delete this application and its history? Use this for data deletion requests.">Delete application</ConfirmButton>
            </form>
          ) : null}
        </div>
      </div>
    </>
  );
}
